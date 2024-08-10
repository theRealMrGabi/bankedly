import {
	Injectable,
	NotFoundException,
	ServiceUnavailableException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, FindOneOptions, FindManyOptions } from 'typeorm'

import { User } from '../users/entities/user.entity'
import { Transaction } from './entities/transaction.entity'
import { PaymentService } from '../services/payment.service'
import { CreateTransactionDto } from './dto/createTransaction.dto'
import { InitiatePaystackDepositDto } from './dto/initiatePaystackDeposit.dto'
import {
	TransactionGateway,
	TransactionStatus,
	TransactionType
} from './transactions.interface'

@Injectable()
export class TransactionService {
	constructor(
		@InjectRepository(Transaction)
		private transactionRepository: Repository<Transaction>,
		private paymentService: PaymentService
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

	/**
	 * paystack callback url sample
	 * http://localhost:7530/api/v1/transactions/verify-paystack-deposit?trxref=3384359f-1590-490b-81b8-9f025ca461f9&reference=3384359f-1590-490b-81b8-9f025ca461f9
	 */

	async verifyPaystackDeposit(reference: string) {
		try {
			const transaction = await this.fetchTransactionByReference(reference)

			return transaction
		} catch (error) {
			throw error
		}
	}
}
