import {
	Injectable,
	ConflictException,
	NotFoundException,
	InternalServerErrorException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Repository } from 'typeorm'
import { instanceToPlain } from 'class-transformer'

import { SignupDto } from '../auth/dto/signup.dto'
import { User } from './entities/user.entity'
import { PaginationAndFilter } from '../interface/utils.interface'

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private userRepository: Repository<User>
	) {}

	async create(createUserDto: SignupDto) {
		const { email, username, phoneNumber } = createUserDto

		const userExists = await this.userRepository.findOne({
			where: [{ email }, { username }, { phoneNumber }]
		})

		if (userExists) {
			throw new ConflictException(
				'Unique email, username or phonenumber must be used. Please try different details'
			)
		}

		const user = this.userRepository.create(createUserDto)
		return await this.userRepository.save(user)
	}

	async findOne(
		query?: Partial<Omit<User, 'lowercaseEmail' | 'hashPassword'>>
	) {
		return await this.userRepository.findOne({
			where: [query]
		})
	}

	async findById(id: string): Promise<User | null> {
		return await this.userRepository.findOne({
			where: {
				id
			},
			relations: ['bankAccounts']
		})
	}

	async findByEmail(email: string) {
		return await this.userRepository.findOne({
			where: {
				email
			}
		})
	}

	async findUsers({
		filters = {},
		page = 1,
		limit = 20,
		sort = 'createdAt',
		order = 'DESC',
		keyword
	}: PaginationAndFilter<User>) {
		const searchKeyword = keyword?.toLowerCase()
		const queryBuilder = this.userRepository.createQueryBuilder('user')

		queryBuilder.leftJoinAndSelect('user.bankAccounts', 'account')

		Object.keys(filters).forEach((key) => {
			queryBuilder.andWhere(`user.${key} = :${key}`, {
				[key]: filters[key]
			})
		})

		if (searchKeyword) {
			queryBuilder.andWhere(
				new Brackets((qb) => {
					qb.where('LOWER(user.username) LIKE :keyword', {
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

		queryBuilder.orderBy(`user.${sort}`, order)

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

	async remove(id: string) {
		const user = await this.findById(id)

		if (!user) throw new NotFoundException('User not found')
		return await this.userRepository.softDelete(id)
	}

	async updateUser({
		userId,
		payload
	}: {
		userId: string
		payload: Partial<User>
	}) {
		const user = await this.findById(userId)
		if (!user) throw new NotFoundException('User not found')

		Object.assign(user, payload)
		try {
			return await this.userRepository.save(user)
		} catch (error) {
			throw new InternalServerErrorException('Error updating user')
		}
	}
}
