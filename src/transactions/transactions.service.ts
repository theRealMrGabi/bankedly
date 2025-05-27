import {
	Injectable,
	NotFoundException,
	ServiceUnavailableException,
	NotAcceptableException,
	BadRequestException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'

import {
	Repository,
	FindOneOptions,
	FindManyOptions,
	DataSource,
	QueryRunner
} from 'typeorm'

import { User } from '../users/entities/user.entity'
import { Transaction } from './entities/transaction.entity'
import { PaymentService } from '../services/payment.service'
import { AccountService } from '../account/account.service'
import { CreateTransactionDto } from './dto/createTransaction.dto'
import { InitiatePaystackDepositDto } from './dto/initiatePaystackDeposit.dto'
import {
	TransactionGateway,
	TransactionStatus,
	TransactionType
} from './transactions.interface'
import { AuditLog } from '../services/auditLog.service'
import { EventsConstants } from '../utils'

@Injectable()
export class TransactionService {
	constructor(
		@InjectRepository(Transaction)
		private transactionRepository: Repository<Transaction>,
		private paymentService: PaymentService,
		private accountService: AccountService,
		private dataSource: DataSource,
		private eventEmitter: EventEmitter2
	) {}

	async findOne(options: FindOneOptions<Transaction>) {
		return await this.transactionRepository.findOne(options)
	}

	async getAll(options?: FindManyOptions<Transaction>) {
		return await this.transactionRepository.find(options)
	}

	async fetchTransactionByReference(reference: string) {
		const transaction = await this.findOne({
			where: {
				reference
			}
		})

		if (!transaction)
			throw new NotFoundException('No transaction with this reference found')
		return transaction
	}

	async initiatePaystackDeposit({
		initiatePaystackDepositDto,
		user
	}: {
		initiatePaystackDepositDto: InitiatePaystackDepositDto
		user: User
	}) {
		try {
			const { email, id: userId } = user
			const { accountId, amount } = initiatePaystackDepositDto

			const amountInKobo = amount * 100

			const depositInfo = await this.paymentService.generatePaystackPaymentUrl({
				email,
				amount: amountInKobo
			})

			if (!depositInfo) {
				throw new ServiceUnavailableException(
					'Paystack payment not available , try again in few seconds'
				)
			}

			const transactionPayload = {
				userId,
				accountId,
				amount: amountInKobo,
				reference: depositInfo.reference,
				type: TransactionType.DEPOSIT,
				detail: {
					receiverAccountNumber: '',
					gateway: TransactionGateway.PAYSTACK
				},
				status: TransactionStatus.IN_PROGRESS
			} satisfies CreateTransactionDto

			const transaction = this.transactionRepository.create(transactionPayload)
			const response = await this.transactionRepository.save(transaction)
			console.log('🚀 ==>create transaction response:', response)

			return {
				message: 'Transaction created successfully',
				data: {
					transaction: response,
					url: depositInfo.authorization_url
				}
			}
		} catch (error) {
			throw error
		}
	}

	async verifyPaystackDeposit({
		reference,
		user
	}: {
		reference: string
		user: User
	}) {
		try {
			const transaction = await this.fetchTransactionByReference(reference)

			if (transaction.status !== TransactionStatus.IN_PROGRESS) {
				throw new NotAcceptableException('Transaction status not supported')
			}

			const amount = parseFloat(transaction.amount.toFixed(2))

			const isValidTransaction =
				await this.paymentService.verifyPaystackPayment({
					reference,
					amount
				})

			if (!isValidTransaction) {
				throw new BadRequestException('Invalid transaction reference')
			}

			const { accountId, id } = transaction

			await this.deposit({
				accountId,
				amount,
				transactionId: id
			})

			this.eventEmitter.emit(EventsConstants.AUDIT_LOG, {
				type: 'User activity',
				action: 'ACCOUNT_DEPOSIT',
				initiatedBy: `${user.lastname} ${user.firstname}`,
				result: 'SUCCESS',
				metadata: {
					accountId,
					amount: `NGN ${amount / 100}`
				}
			} satisfies AuditLog)

			return {
				message: `Deposit of NGN${amount / 100} successful`
			}
		} catch (error) {
			throw error
		}
	}

	async deposit({
		accountId,
		amount,
		transactionId
	}: {
		accountId: string
		transactionId: string
		amount: number
	}) {
		const queryRunner = this.dataSource.createQueryRunner()
		await queryRunner.startTransaction()

		try {
			await this.accountService.topUpBalance({ accountId, amount, queryRunner })

			await this.updateStatus({
				transactionId,
				status: TransactionStatus.SUCCESS,
				queryRunner
			})

			await queryRunner.commitTransaction()
		} catch (error) {
			await queryRunner.rollbackTransaction()
			throw new BadRequestException('Deposit failed')
		} finally {
			await queryRunner.release()
		}
	}

	async updateStatus({
		transactionId,
		status,
		queryRunner
	}: {
		transactionId: string
		status: TransactionStatus
		queryRunner: QueryRunner
	}) {
		const transaction = await this.findOne({
			where: {
				id: transactionId
			}
		})

		if (!transaction) throw new NotFoundException('Transaction not found')

		// await this.transactionRepository
		// 	.createQueryBuilder()
		// 	.update(Transaction)
		// 	.set({ status })
		// 	.where('id = :transactionId', { transactionId })
		// 	.execute()

		transaction.status = status
		return await queryRunner.manager.save(transaction)
	}
}
