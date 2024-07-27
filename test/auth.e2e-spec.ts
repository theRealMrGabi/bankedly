import * as request from 'supertest'
import { randEmail, randPassword } from '@ngneat/falso'

import { app } from './setup'
import { SignupPayload, SignupUser, SigninPayload } from './helpers/auth'

describe('Signup controller should', () => {
	const signupUrl = '/auth/signup'

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
			// expect(generateOTPCodeMock).toHaveBeenCalled()
		} catch (error) {
			throw error
		}
	})
})

describe('Signin controller should', () => {
	const signinUrl = '/auth/signin'

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

	// it('return 200 statusCode for a successul login', async () => {
	// 	await SignupUser()

	// 	const otpCode = getOtpCode()

	// 	const activateAccountResponse = await request(app.getHttpServer)
	// 		.patch('/auth/activate')
	// 		.send({ otpCode })

	// 	console.log('🚀 ==> activateAccountResponse:', activateAccountResponse.body)

	// 	console.log('SigninPayload --->', SigninPayload)

	// 	const response = await request(app.getHttpServer())
	// 		.post(signinUrl)
	// 		.send(SigninPayload)

	// 	console.log('🚀 ==> response:', response.statusCode)
	// 	console.log('🚀 ==> response body:', response.body)

	// 	expect(response.statusCode).toBe(200)
	// 	// expect(response.body).toMatchObject({
	// 	// 	status: true,
	// 	// 	message: 'Signin successful',
	// 	// 	data: expect.any(Object)
	// 	// })
	// })

	// it('return 200 statusCode for a successul login', async () => {
	// 	await SignupUser()

	// 	console.log('SigninPayload --->', SigninPayload)

	// 	const response = await request(app.getHttpServer())
	// 		.post(signinUrl)
	// 		.send(SigninPayload)

	// 	console.log('🚀 ==> response:', response.statusCode)
	// 	console.log('🚀 ==> response body:', response.body)

	// 	expect(response.statusCode).toBe(200)
	// 	// expect(response.body).toMatchObject({
	// 	// 	status: true,
	// 	// 	message: 'Signin successful',
	// 	// 	data: expect.any(Object)
	// 	// })
	// })
})
