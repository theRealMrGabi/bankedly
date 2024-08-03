import {
	BadRequestException,
	Injectable,
	NotFoundException,
	Inject,
	ForbiddenException,
	UnauthorizedException,
	ConflictException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { EventEmitter2 } from '@nestjs/event-emitter'
import * as bcrypt from 'bcryptjs'
import { instanceToPlain } from 'class-transformer'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'

import { UsersService } from '../users/users.service'
import { MailDto } from '../services/postmark.service'
import { OtpService } from '../services/otp.service'
import { welcomeEmail, forgotPasswordEmail } from '../helpers/email'
import { EventsConstants, RedisKeys } from '../utils'

import { SignupDto } from './dto/signup.dto'
import { SigninDto } from './dto/signin.dto'
import { VerifyOtpDto } from './dto/verifyEmail.dto'
import { EmailDto } from './dto/email.dto'
import { ResetPasswordDto } from './dto/resetPassword.dto'
import { AccountStatus, UserRoles } from '../users/users.interface'
import { AuditLog } from '../services/auditLog.service'
import { CreateBackOfficeStaffDto } from '../users/dto/createBackofficeStaff.dto'
import { User } from '../users/entities/user.entity'

@Injectable()
export class AuthService {
	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private otpService: OtpService,
		private usersService: UsersService,
		private eventEmitter: EventEmitter2,
		private jwtService: JwtService
	) {}

	async signup(signupDto: SignupDto) {
		const { email, firstname, lastname } = signupDto
		await this.usersService.create(signupDto)

		const activationCode = this.otpService.generateOtp()
		await this.cacheManager.set(
			`${RedisKeys.EMAIL_VALIDATION}_${email?.toLowerCase()}`,
			activationCode,
			RedisKeys.CACHE_TTL
		)

		this.eventEmitter.emit(EventsConstants.SEND_EMAIL, {
			emailSubject: 'Welcome to Bandkedly',
			emailRecipient: email,
			htmlContent: welcomeEmail({
				recipientName: `${lastname} ${firstname}`,
				otpCode: activationCode
			})
		} satisfies MailDto)

		this.eventEmitter.emit(EventsConstants.AUDIT_LOG, {
			type: 'User activity',
			action: 'NEW USER SIGN UP',
			initiatedBy: `${firstname} ${lastname}`,
			result: 'SUCCESS',
			metadata: signupDto
		} satisfies AuditLog)

		return {
			message:
				'Signup successful. Instructions on email verification has been sent to your email.'
		}
	}

	async signin(signinDto: SigninDto) {
		const { email, password } = signinDto

		const user = await this.usersService.findByEmail(email.toLowerCase())

		if (!user) {
			throw new BadRequestException('Invalid credentials')
		}

		if (user.accountStatus !== AccountStatus.ACTIVE) {
			throw new ForbiddenException('Contact admin')
		}

		if (user.role !== UserRoles.CUSTOMER) {
			throw new ForbiddenException('Invalid login request')
		}

		const isValidPassword = await bcrypt.compare(password, user.password)

		if (!isValidPassword) {
			throw new BadRequestException('Invalid credentials')
		}

		if (!user.isEmailVerified) {
			throw new BadRequestException('Email address verification is required')
		}

		this.eventEmitter.emit(EventsConstants.AUDIT_LOG, {
			type: 'User activity',
			action: 'USER SIGN IN',
			initiatedBy: `${user.firstname} ${user.lastname}`,
			result: 'SUCCESS',
			metadata: signinDto
		} satisfies AuditLog)

		return {
			access_token: await this.jwtService.signAsync({
				id: user.id
			}),
			...instanceToPlain(user)
		}
	}

	async createBackOfficeStaff({
		payload,
		admin
	}: {
		payload: CreateBackOfficeStaffDto
		admin: User
	}) {
		const { email, username, phoneNumber, firstname, lastname } = payload

		const userExists = await this.usersService.findOne({
			email,
			username,
			phoneNumber
		})

		if (userExists) {
			throw new ConflictException(
				'Unique email, username or phonenumber must be used. Please try different details'
			)
		}

		await this.usersService.create(payload)

		const activationCode = this.otpService.generateOtp()
		await this.cacheManager.set(
			`${RedisKeys.EMAIL_VALIDATION}_${email.toLowerCase()}`,
			activationCode,
			RedisKeys.CACHE_TTL
		)

		this.eventEmitter.emit(EventsConstants.SEND_EMAIL, {
			emailSubject: 'Welcome to Bandkedly',
			emailRecipient: email,
			htmlContent: welcomeEmail({
				recipientName: `${lastname} ${firstname}`,
				otpCode: activationCode
			})
		} satisfies MailDto)

		this.eventEmitter.emit(EventsConstants.AUDIT_LOG, {
			type: 'Backoffice activity',
			action: 'NEW BACK OFFICER CREATED',
			initiatedBy: `${admin.firstname} ${admin.lastname}`,
			result: 'SUCCESS',
			metadata: payload
		} satisfies AuditLog)

		return {
			message:
				'Signup successful. Instructions on email verification has been sent to your email.'
		}
	}

	async backOfficesignin(signinDto: SigninDto) {
		const { email, password } = signinDto

		const user = await this.usersService.findByEmail(email.toLowerCase())

		if (!user) {
			throw new BadRequestException('Invalid credentials')
		}

		if (user.accountStatus !== AccountStatus.ACTIVE) {
			throw new ForbiddenException('Contact admin')
		}

		if (user.role === UserRoles.CUSTOMER) {
			throw new ForbiddenException('Invalid login request')
		}

		const isValidPassword = await bcrypt.compare(password, user.password)

		if (!isValidPassword) {
			throw new BadRequestException('Invalid credentials')
		}

		if (!user.isEmailVerified) {
			throw new BadRequestException('Email address verification is required')
		}

		this.eventEmitter.emit(EventsConstants.AUDIT_LOG, {
			type: 'Backoffice activity',
			action: 'BACKOFFICE SIGN IN',
			initiatedBy: `${user.firstname} ${user.lastname}`,
			result: 'SUCCESS',
			metadata: signinDto
		} satisfies AuditLog)

		return {
			access_token: await this.jwtService.signAsync({
				id: user.id
			}),
			...instanceToPlain(user)
		}
	}

	async activateAccount(verifyOtpDto: VerifyOtpDto) {
		const { otpCode, email } = verifyOtpDto
		const redisKey = `${RedisKeys.EMAIL_VALIDATION}_${email.toLowerCase()}`

		const cacheOtpCode = await this.cacheManager.get<string>(redisKey)

		if (!cacheOtpCode) {
			throw new BadRequestException('Invalid OTP')
		}

		const user = await this.usersService.findByEmail(email)
		if (!user) {
			throw new BadRequestException('Invalid OTP')
		}

		if (cacheOtpCode !== otpCode) {
			throw new BadRequestException('Invalid OTP code')
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

	async forgotPassword(forgotPasswordDto: EmailDto) {
		const email = forgotPasswordDto.email.toLowerCase()

		const user = await this.usersService.findByEmail(email)

		if (!user) {
			throw new NotFoundException('User not found')
		}

		if (!['active', 'inactive'].includes(user.accountStatus)) {
			throw new ForbiddenException(
				'Your access to the platform has been revoked, contact admin'
			)
		}

		const resetPasswordCode = this.otpService.generateOtp()
		await this.cacheManager.set(
			`${user.email}_${RedisKeys.RESET_PASSWORD}`,
			resetPasswordCode,
			RedisKeys.CACHE_TTL
		)

		this.eventEmitter.emit(EventsConstants.SEND_EMAIL, {
			emailSubject: 'Password Change Request - Bankedly',
			emailRecipient: email,
			htmlContent: forgotPasswordEmail({
				recipientName: `${user.lastname} ${user.firstname}`,
				otpCode: resetPasswordCode
			})
		} satisfies MailDto)

		return {
			message:
				'Instructions on how to reset your password has been sent to your email.'
		}
	}

	async resetPassword({
		emailDto,
		resetPasswordDto
	}: {
		emailDto: EmailDto
		resetPasswordDto: ResetPasswordDto
	}) {
		const email = emailDto.email
		const { password, otpCode } = resetPasswordDto

		const redisKey = `${email}_${RedisKeys.RESET_PASSWORD}`

		const cacheOtpCode = await this.cacheManager.get<string>(redisKey)

		if (!cacheOtpCode) {
			throw new BadRequestException('Invalid OTP code')
		}

		const user = await this.usersService.findByEmail(email)

		if (!user) {
			throw new NotFoundException('User not found')
		}

		if (cacheOtpCode !== otpCode) {
			throw new BadRequestException('Invalid OTP code')
		}

		if (!['active', 'inactive'].includes(user.accountStatus)) {
			throw new ForbiddenException(
				'Your access to the platform has been revoked, contact admin'
			)
		}

		await this.usersService.updateUser({
			userId: user.id,
			payload: {
				password
			}
		})

		await this.cacheManager.del(redisKey)

		return { message: 'Password successfully changed' }
	}

	async signout(token: string) {
		try {
			const payload = await this.jwtService.verifyAsync(token)

			const expirationTime = payload.exp * 1000 // Convert to milliseconds
			const currentTime = Date.now()
			const timeUntilExpiration = expirationTime - currentTime

			if (timeUntilExpiration > 0) {
				await this.cacheManager.set(
					`${RedisKeys.BLACKLIST_TOKEN}_${token}`,
					payload.id,
					timeUntilExpiration
				)
			}

			return {
				message: 'Signout successful'
			}
		} catch (error) {
			throw new UnauthorizedException('Invalid token')
		}
	}
}
