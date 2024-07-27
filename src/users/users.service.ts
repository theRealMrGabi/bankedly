import {
	Injectable,
	ConflictException,
	NotFoundException,
	InternalServerErrorException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { SignupDto } from '../auth/dto/signup.dto'
import { User } from './entities/user.entity'

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

	async findById(id: string) {
		return this.userRepository.findOne({
			where: {
				id
			}
		})
	}

	async findByEmail(email: string) {
		return this.userRepository.findOne({
			where: {
				email
			}
		})
	}

	async find(email: string) {
		return await this.userRepository.find({ where: { email } })
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
