import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { instanceToPlain } from 'class-transformer'

import { UsersService } from '../users/users.service'
import { SignupDto } from './dto/signup.dto'
import { SigninDto } from './dto/signin.dto'

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService
	) {}

	async signup(sigupDto: SignupDto) {
		return this.usersService.create(sigupDto)
	}

	async signin(signinDto: SigninDto) {
		const { email, password } = signinDto

		const user = await this.usersService.findByEmail(email)

		if (!user) {
			throw new NotFoundException('User not found')
		}

		const isValidPassword = await bcrypt.compare(password, user.password)

		if (!isValidPassword) {
			throw new BadRequestException('Invalid login credential')
		}

		if (!user.isEmailVerified) {
			throw new BadRequestException('Email address verification is required')
		}

		const payload = { sub: user.id, email: user.email }

		return {
			access_token: await this.jwtService.signAsync(payload),
			...instanceToPlain(user)
		}
	}
}
