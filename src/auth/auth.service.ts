import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { EventEmitter2 } from '@nestjs/event-emitter'
import * as bcrypt from 'bcryptjs'
import { instanceToPlain } from 'class-transformer'

import { UsersService } from '../users/users.service'
import { SignupDto } from './dto/signup.dto'
import { SigninDto } from './dto/signin.dto'
import { MailDto } from '../services/postmark.service'
import { welcomeEmail } from '../helpers/email'
import { EventsConstants } from '../utils'

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private eventEmitter: EventEmitter2,
		private jwtService: JwtService
	) {}

	async signup(signupDto: SignupDto) {
		const { email, firstname, lastname } = signupDto
		await this.usersService.create(signupDto)

		this.eventEmitter.emit(EventsConstants.SEND_EMAIL, {
			emailSubject: 'Welcome to Bandkedly',
			emailRecipient: email,
			htmlContent: welcomeEmail({
				recipientName: `${lastname} ${firstname}`,
				verificationLink: 'https://verificiation-link-meant-to-be-here'
			})
		} satisfies MailDto)

		return {
			message:
				'Signup successful. Instructions on email verification has been sent to your email.'
		}
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
