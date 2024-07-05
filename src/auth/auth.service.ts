import {
	BadRequestException,
	Injectable,
	NotFoundException,
	Inject
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { EventEmitter2 } from '@nestjs/event-emitter'
import * as bcrypt from 'bcryptjs'
import { instanceToPlain } from 'class-transformer'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'

import { UsersService } from '../users/users.service'
import { SignupDto } from './dto/signup.dto'
import { SigninDto } from './dto/signin.dto'
import { VerifyOtpDto } from './dto/verifyEmail.dto'
import { MailDto } from '../services/postmark.service'
import { welcomeEmail } from '../helpers/email'
import { EventsConstants, RedisKeys } from '../utils'
import { generateOTPCode } from './../utils/index'

@Injectable()
export class AuthService {
	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private usersService: UsersService,
		private eventEmitter: EventEmitter2,
		private jwtService: JwtService
	) {}

	async signup(signupDto: SignupDto) {
		const { email, firstname, lastname } = signupDto
		await this.usersService.create(signupDto)

		const activationCode = generateOTPCode()
		await this.cacheManager.set(
			`${RedisKeys.EMAIL_VALIDATION}_${activationCode}`,
			email.toLowerCase(),
			600000
		) //ttl is 10mins

		this.eventEmitter.emit(EventsConstants.SEND_EMAIL, {
			emailSubject: 'Welcome to Bandkedly',
			emailRecipient: email,
			htmlContent: welcomeEmail({
				recipientName: `${lastname} ${firstname}`,
				otpCode: activationCode
			})
		} satisfies MailDto)

		return {
			message:
				'Signup successful. Instructions on email verification has been sent to your email.'
		}
	}

	async signin(signinDto: SigninDto) {
		const { email, password } = signinDto

		const user = await this.usersService.findByEmail(email.toLowerCase())

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

	async activateAccount(verifyOtpDto: VerifyOtpDto) {
		const { otpCode } = verifyOtpDto
		const redisKey = `${RedisKeys.EMAIL_VALIDATION}_${otpCode}`

		const email = (await this.cacheManager.get<string>(redisKey))?.toLowerCase()

		if (!email) {
			throw new BadRequestException('Invalid OTP')
		}

		const user = await this.usersService.findByEmail(email)
		if (!user) {
			throw new BadRequestException('Invalid OTP')
		}

		await this.usersService.updateUser({
			userId: user.id,
			payload: {
				isEmailVerified: true,
				emailVerifiedAt: new Date()
			}
		})
		await this.cacheManager.del(redisKey)

		return { message: 'Account activated successfully' }
	}
}
