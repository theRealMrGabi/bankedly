import * as request from 'supertest'
import { randEmail, randPassword } from '@ngneat/falso'

import { app } from './setup'
import { SignupPayload, SignupUser, SigninPayload } from './helpers/auth'
import { getMockCache, getMockedOtpCode } from '../src/app.test.module'
import { RedisKeys, generateRandomNumber } from '../src/utils'

const signupUrl = '/auth/signup'
const signinUrl = '/auth/signin'
const activateAccountUrl = '/auth/activate'
const forgotPasswordUrl = '/auth/forgot-password'
const resetPasswordUrl = '/auth/reset-password'

describe('Signup user should', () => {
	it('return error messages if required fields are not passed during signup', async () => {
		const response = await request(app.getHttpServer()).post(signupUrl).send()

		expect(response.statusCode).toBe(400)
		expect(response.body).toEqual(
			expect.objectContaining({
				message: expect.arrayContaining([
					'Username can only be alphabets or alphanumeric. No symbol or signs is allowed',
					'username must be a string',
					'username should not be empty',
					'Password must contain lowercase, uppercase, number, special character and must be minumum of 8 characters',
					'password must be a string',
					'password should not be empty',
					'firstname must be a string',
					'firstname should not be empty',
					'lastname must be a string',
					'lastname should not be empty',
					'email must be an email',
					'email should not be empty',
					'Phone number must match this format +2348023456789',
					'phoneNumber must be a valid phone number'
				]),
				error: 'Bad Request',
				statusCode: 400
			})
		)
	})

	it('register unique email address, username or phone number during signup', async () => {
		await SignupUser()

		const response = await request(app.getHttpServer())
			.post(signupUrl)
			.send(SignupPayload)

		expect(response.statusCode).toBe(409)
		expect(response.body.message).toEqual(
			'Unique email, username or phonenumber must be used. Please try different details'
		)
	})

	it('successfully signup a user', async () => {
		try {
			const response = await request(app.getHttpServer())
				.post(signupUrl)
				.send(SignupPayload)

			expect(response.statusCode).toBe(201)
			expect(response.body.message).toEqual(
				'Signup successful. Instructions on email verification has been sent to your email.'
			)
		} catch (error) {
			throw error
		}
	})

	it('throw error if required fields are not submitted when activating a user account', async () => {
		await SignupUser()

		const response = await request(app.getHttpServer())
			.patch(activateAccountUrl)
			.send({})
			.expect(400)

		expect(response.body).toEqual(
			expect.objectContaining({
				message: expect.arrayContaining([
					'otpCode must be a 6-digit number',
					'otpCode must be longer than or equal to 6 characters',
					'otpCode must be a string',
					'otpCode should not be empty',
					'email must be an email',
					'email should not be empty'
				])
			})
		)
	})

	it('throw error if an invalid code is used to activate a user account', async () => {
		await SignupUser()

		const response = await request(app.getHttpServer())
			.patch(activateAccountUrl)
			.send({
				otpCode: generateRandomNumber(),
				email: SigninPayload.email
			})
			.expect(400)

		expect(response.body.message).toEqual('Invalid OTP code')
	})

	it('successfully activate a user account', async () => {
		await SignupUser()
		const otpCode = getMockedOtpCode()

		const response = await request(app.getHttpServer())
			.patch(activateAccountUrl)
			.send({ otpCode, email: SigninPayload.email })
			.expect(200)

		expect(response.body.message).toEqual('Account activated successfully')
	})
})

describe('Signin controller should', () => {
	it('return 400 status code if required fields are not passed', async () => {
		const response = await request(app.getHttpServer()).post(signinUrl).send()

		expect(response.statusCode).toBe(400)
		expect(response.body).toEqual(
			expect.objectContaining({
				message: expect.arrayContaining([
					'email must be an email',
					'email should not be empty',
					'password must be a string',
					'password should not be empty'
				]),
				error: 'Bad Request',
				statusCode: 400
			})
		)
	})

	it('return error when invalid signin credentials is used', async () => {
		const response = await request(app.getHttpServer()).post(signinUrl).send({
			email: randEmail(),
			password: randPassword()
		})

		expect(response.statusCode).toBe(400)
		expect(response.body.message).toEqual('Invalid credentials')
	})

	it('throw error if a signed up user uses an invalid password to login ', async () => {
		await SignupUser()

		const response = await request(app.getHttpServer()).post(signinUrl).send({
			email: SigninPayload.email,
			password: randPassword()
		})

		expect(response.statusCode).toBe(400)
		expect(response.body.message).toEqual('Invalid credentials')
	})

	it('require an account is verified before a successul login', async () => {
		await SignupUser()

		const response = await request(app.getHttpServer())
			.post(signinUrl)
			.send(SigninPayload)

		expect(response.statusCode).toBe(400)
		expect(response.body.message).toEqual(
			'Email address verification is required'
		)
	})

	it('return 200 statusCode for a successul login', async () => {
		await SignupUser()
		const otpCode = getMockedOtpCode()

		const activateAccountResponse = await request(app.getHttpServer())
			.patch(activateAccountUrl)
			.send({ otpCode, email: SigninPayload.email })
			.expect(200)

		expect(activateAccountResponse.body.message).toEqual(
			'Account activated successfully'
		)

		const response = await request(app.getHttpServer())
			.post(signinUrl)
			.send(SigninPayload)
			.expect(201)

		expect(response.body).toHaveProperty('access_token')
		expect(response.body).toHaveProperty('id')
		expect(response.body).toHaveProperty('username')
		expect(response.body).toHaveProperty('firstname')
		expect(response.body).toHaveProperty('lastname')
		expect(response.body).toHaveProperty('email')
		expect(response.body).toHaveProperty('phoneNumber')
		expect(response.body).toHaveProperty('isEmailVerified')
		expect(response.body).toHaveProperty('emailVerifiedAt')
		expect(response.body).toHaveProperty('accountStatus')
		expect(response.body).toHaveProperty('role')
		expect(response.body).toHaveProperty('createdAt')
		expect(response.body).toHaveProperty('updatedAt')
	})
})

describe('Forgot password should', () => {
	it('throw error if required fields are not passed', async () => {
		const response = await request(app.getHttpServer())
			.post(forgotPasswordUrl)
			.send()
			.expect(400)

		expect(response.body).toEqual(
			expect.objectContaining({
				message: expect.arrayContaining([
					'email must be an email',
					'email should not be empty'
				])
			})
		)
	})

	it('throw error if invalid user initiates this request', async () => {
		const response = await request(app.getHttpServer())
			.post(forgotPasswordUrl)
			.send({ email: randEmail() })
			.expect(404)

		expect(response.body.message).toEqual('User not found')
	})

	it('expect that the OTP Code sent should be saved in cache and should return a success message', async () => {
		await SignupUser()

		const email = SigninPayload.email

		const response = await request(app.getHttpServer())
			.post(forgotPasswordUrl)
			.send({ email })
			.expect(201)

		const mockedOtpCode = getMockedOtpCode()
		const mockCache = getMockCache()
		const mockedCacheOtp = await mockCache.get(
			`${email}_${RedisKeys.RESET_PASSWORD}`
		)

		expect(mockedCacheOtp).toBe(mockedOtpCode)
		expect(response.body.message).toEqual(
			'Instructions on how to reset your password has been sent to your email.'
		)
	})
})

describe('Reset password should', () => {
	const password = 'Password@123!'

	it('throw error if required fields are not passed', async () => {
		const response = await request(app.getHttpServer())
			.patch(resetPasswordUrl)
			.send()
			.expect(400)

		expect(response.body).toEqual(
			expect.objectContaining({
				message: expect.arrayContaining([
					'otpCode must be a 6-digit number',
					'otpCode must be longer than or equal to 6 characters',
					'otpCode must be a string',
					'otpCode should not be empty',
					'Password must contain lowercase, uppercase, number, special character and must be minumum of 8 characters',
					'password must be a string',
					'password should not be empty'
				])
			})
		)
	})

	it('throw error if body is passed but no email param is passed', async () => {
		const response = await request(app.getHttpServer())
			.patch(resetPasswordUrl)
			.send({
				otpCode: generateRandomNumber(),
				password
			})
			.expect(400)

		expect(response.body).toEqual(
			expect.objectContaining({
				message: expect.arrayContaining([
					'email must be an email',
					'email should not be empty'
				])
			})
		)
	})

	it('throw error if wrong/invalid otpcode is passed', async () => {
		await SignupUser()

		const email = SigninPayload.email

		await request(app.getHttpServer())
			.post(forgotPasswordUrl)
			.send({ email })
			.expect(201)

		const response = await request(app.getHttpServer())
			.patch(`${resetPasswordUrl}?email=${email}`)
			.send({
				otpCode: generateRandomNumber(),
				password
			})
			.expect(400)

		expect(response.body.message).toEqual('Invalid OTP code')
	})

	it('successfully reset a user password and use the new password to sign in successfully', async () => {
		const email = SigninPayload.email

		await SignupUser()

		await request(app.getHttpServer())
			.post(forgotPasswordUrl)
			.send({ email })
			.expect(201)

		const otpCode = getMockedOtpCode()

		await request(app.getHttpServer())
			.patch(activateAccountUrl)
			.send({ otpCode, email: SigninPayload.email })
			.expect(200)

		const response = await request(app.getHttpServer())
			.patch(`${resetPasswordUrl}?email=${email}`)
			.send({
				otpCode,
				password
			})
			.expect(200)

		expect(response.body.message).toEqual('Password successfully changed')

		await request(app.getHttpServer())
			.post(signinUrl)
			.send({ email, password })
			.expect(201)
	})
})
