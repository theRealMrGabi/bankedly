import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Repository } from 'typeorm'
import { instanceToPlain } from 'class-transformer'
import { EventEmitter2 } from '@nestjs/event-emitter'

import { Account } from './entities/account.entity'
import { AccountPagination } from './account.interface'
import { CreateAccountDto } from './dto/account.dto'
import { User } from '../users/entities/user.entity'
import { EventsConstants } from '../utils'
import { AuditLog } from '../services/auditLog.service'

@Injectable()
export class AccountService {
	constructor(
		@InjectRepository(Account) private accountRepository: Repository<Account>,
		private eventEmitter: EventEmitter2
	) {}

	async getAccounts({
		filters = {},
		page = 1,
		limit = 20,
		sort = 'createdAt',
		order = 'DESC',
		status,
		type,
		keyword
	}: AccountPagination) {
		const searchKeyword = keyword
		const queryBuilder = this.accountRepository.createQueryBuilder('account')

		queryBuilder.leftJoinAndSelect('account.user', 'user')

		Object.keys(filters).forEach((key) => {
			queryBuilder.andWhere(`account.${key} = :${key}`, {
				[key]: filters[key]
			})
		})

		if (searchKeyword) {
			queryBuilder.andWhere(
				new Brackets((qb) => {
					qb.where('account.accountNumber LIKE :keyword', {
						keyword: `%${searchKeyword}`
					})
						.orWhere('LOWER(user.username) LIKE :keyword', {
							keyword: `%${searchKeyword}%`
						})
						.orWhere('LOWER(user.firstname) LIKE :keyword', {
							keyword: `%${searchKeyword}%`
						})
						.orWhere('LOWER(user.lastname) LIKE :keyword', {
							keyword: `%${searchKeyword}%`
						})
						.orWhere('LOWER(user.email) LIKE :keyword', {
							keyword: `%${searchKeyword}%`
						})
						.orWhere('LOWER(user.phoneNumber) LIKE :keyword', {
							keyword: `%${searchKeyword}%`
						})
				})
			)
		}

		if (type) {
			queryBuilder.andWhere('account.type = :type', { type })
		}

		if (status) {
			queryBuilder.andWhere('account.status = :status', { status })
		}

		queryBuilder.orderBy(`account.${sort}`, order)

		const total_count = await queryBuilder.getCount()

		queryBuilder.skip((page - 1) * limit).take(limit)

		const items = await queryBuilder.getMany()

		const serializedItems = instanceToPlain(items)

		const pages = Math.ceil(total_count / limit)

		return {
			page,
			pages,
			limit,
			total_count,
			items: serializedItems
		}
	}

	async findById(id: string): Promise<Account> {
		const response = await this.accountRepository.findOne({
			where: {
				id
			}
		})

		return instanceToPlain(response) as Account
	}

	async findByUserId(userId: string): Promise<Account[]> {
		const response = await this.accountRepository.find({
			where: {
				user: {
					id: userId
				}
			}
		})

		return instanceToPlain(response) as Account[]
	}

	async createAccount({
		createAccountDto,
		user
	}: {
		createAccountDto: CreateAccountDto
		user: User
	}) {
		try {
			const payload = {
				...createAccountDto,
				user,
				accountNumber: await this.createAccountNumber()
			}

			const account = this.accountRepository.create(payload)
			const response = await this.accountRepository.save(account)

			this.eventEmitter.emit(EventsConstants.AUDIT_LOG, {
				type: 'User activity',
				action: `NEW_ACCOUNT_GENERATED`,
				initiatedBy: `${response.user.firstname} ${response.user.lastname}`,
				result: 'SUCCESS',
				metadata: {
					accountType: response.type
				}
			} satisfies AuditLog)

			delete response.user
			return {
				message: 'Account details generated successfully',
				data: response
			}
		} catch (error) {
			throw error
		}
	}

	private generateAccountNumber(): string {
		let accountNumber = ''
		for (let i = 0; i < 10; i++) {
			accountNumber += Math.floor(Math.random() * 10)
		}
		return accountNumber
	}

	private async createAccountNumber() {
		let accountNo = ''
		while (accountNo == '') {
			const result = this.generateAccountNumber()

			const accountNumberExists = await this.accountRepository.findOne({
				where: {
					accountNumber: result
				}
			})

			if (!accountNumberExists) {
				accountNo = result
				break
			}
		}
		return accountNo
	}
}
