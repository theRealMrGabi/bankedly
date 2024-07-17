import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcryptjs'
import { randNumber } from '@ngneat/falso'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { VerifyOtpDto } from './dto/verifyEmail.dto'
import { EmailDto } from './dto/email.dto'
import { ResetPasswordDto } from './dto/resetPassword.dto'

import { UsersService } from '../users/users.service'
import { AccountStatus, UserRoles } from '../users/users.interface'
import { User } from '../users/entities/user.entity'

import { authMockProviders } from '../../test/mocks/auth.mocks'
import { SignupPayload, SigninPayload } from '../../test/helpers/auth'

describe('AuthController', () => {
	let controller: AuthController
	let authService: AuthService
	let usersService: UsersService

	let mockUser: User

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [AuthService, ...authMockProviders]
		}).compile()

		controller = module.get<AuthController>(AuthController)
		authService = module.get<AuthService>(AuthService)
		usersService = module.get<UsersService>(UsersService)

		const salt = await bcrypt.genSalt(12)
		const hashedPassword = await bcrypt.hash(SignupPayload.password, salt)

		mockUser = {
			...SignupPayload,
			password: hashedPassword, // Use the hashed password
			isEmailVerified: true,
			emailVerifiedAt: new Date(),
			accountStatus: AccountStatus.ACTIVE,
			role: UserRoles.CUSTOMER,
			createdAt: new Date(),
			updatedAt: new Date(),
			id: '1',
			lowercaseEmail: jest.fn(),
			hashPassword: jest.fn()
		}

		// Mock the user creation
		jest.spyOn(usersService, 'create').mockResolvedValue(mockUser)

		// Mock findByEmail to return our "created" user
		jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
		expect(authService).toBeDefined()
	})

	it('should signup a user', async () => {
		jest.spyOn(authService, 'signup')

		const res = await controller.signupUser(SignupPayload)

		expect(res.message).toEqual(
			'Signup successful. Instructions on email verification has been sent to your email.'
		)
		expect(authService.signup).toHaveBeenCalledWith(SignupPayload)
	})

	it('should signin a user', async () => {
		jest.spyOn(authService, 'signin')

		try {
			const res = await controller.signin(SigninPayload)
			expect(res).toMatchObject(mockUser)
			expect(authService.signin).toHaveBeenCalledWith(SigninPayload)
		} catch (error) {
			throw error
		}
	})

	it('should activate an account', async () => {
		const verifyOtpDto = {
			otpCode: randNumber({ length: 6 }).toString()
		} satisfies VerifyOtpDto

		const mockActivateResponse = { message: 'Account activated successfully' }
		jest
			.spyOn(authService, 'activateAccount')
			.mockResolvedValue(mockActivateResponse)

		const res = await controller.activateAccount(verifyOtpDto)

		expect(res).toEqual(mockActivateResponse)
		expect(authService.activateAccount).toHaveBeenCalledWith(verifyOtpDto)
	})

	it('should handle forgot password request', async () => {
		const emailDto = { email: SignupPayload.email }
		const mockForgotPasswordResponse = {
			message:
				'Instructions on how to reset your password has been sent to your email.'
		}
		jest
			.spyOn(authService, 'forgotPassword')
			.mockResolvedValue(mockForgotPasswordResponse)

		const res = await controller.forgotPassword(emailDto)

		expect(res).toEqual(mockForgotPasswordResponse)
		expect(authService.forgotPassword).toHaveBeenCalledWith(emailDto)
	})

	it('should reset password', async () => {
		const emailDto = { email: SignupPayload.email } satisfies EmailDto
		const resetPasswordDto = {
			password: 'newPassword123',
			otpCode: randNumber({ length: 6 }).toString()
		} satisfies ResetPasswordDto

		const mockResetPasswordResponse = {
			message: 'Password successfully changed'
		}
		jest
			.spyOn(authService, 'resetPassword')
			.mockResolvedValue(mockResetPasswordResponse)

		const res = await controller.resetPassword(emailDto, resetPasswordDto)

		expect(res).toEqual(mockResetPasswordResponse)
		expect(authService.resetPassword).toHaveBeenCalledWith({
			emailDto,
			resetPasswordDto
		})
	})
})
