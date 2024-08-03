import * as request from 'supertest'

import { app } from './setup'
import {
	SigninUser,
	SigninSuperAdmin,
	CheckFailedAuthentication,
	SignupBackOfficeEditorPayload
} from './helpers/auth'
import { randEmail, randUuid } from '@ngneat/falso'
import { getMockedOtpCode } from '../src/app.test.module'
import { activateAccountUrl, backOfficeSignin } from './auth.e2e-spec'

const getUsersUrl = '/users'

describe('User controller should', () => {
	describe('Allow admin get all users and', () => {
		it('throw error if an unauthenticated user tries to access the endpoint', async () => {
			await CheckFailedAuthentication({ url: getUsersUrl })
		})

		it('throw error if a customer tries to get all users', async () => {
			const { access_token } = await SigninUser({})

			const response = await request(app.getHttpServer())
				.get(getUsersUrl)
				.set('Authorization', `Bearer ${access_token}`)
				.expect(401)

			expect(response.body.message).toEqual('Insufficient permissions')
		})

		it('return list of users', async () => {
			const { access_token } = await SigninSuperAdmin()

			const response = await request(app.getHttpServer())
				.get(getUsersUrl)
				.set('Authorization', `Bearer ${access_token}`)
				.expect(200)

			const responseBody = response.body
			const items = responseBody.items as []

			expect(responseBody).toHaveProperty('page')
			expect(responseBody).toHaveProperty('pages')
			expect(responseBody).toHaveProperty('limit')
			expect(responseBody).toHaveProperty('total_count')
			expect(responseBody).toHaveProperty('items')
			expect(Array.isArray(items)).toBe(true)

			items.forEach((item) => {
				expect(item).toHaveProperty('id')
				expect(item).toHaveProperty('username')
				expect(item).toHaveProperty('firstname')
				expect(item).toHaveProperty('lastname')
				expect(item).toHaveProperty('email')
				expect(item).toHaveProperty('phoneNumber')
				expect(item).toHaveProperty('isEmailVerified')
				expect(item).toHaveProperty('emailVerifiedAt')
				expect(item).toHaveProperty('accountStatus')
				expect(item).toHaveProperty('role')
				expect(item).toHaveProperty('createdAt')
				expect(item).toHaveProperty('updatedAt')
			})
		})
	})

	describe('allow users get their own personal details', () => {
		const getMeUrl = '/users/me'

		it('throw error if an unauthenticated user tries to access the endpoint', async () => {
			await CheckFailedAuthentication({ url: getMeUrl })
		})

		it('return their details', async () => {
			const { access_token } = await SigninUser({})

			const response = await request(app.getHttpServer())
				.get(getMeUrl)
				.set('Authorization', `Bearer ${access_token}`)
				.expect(200)

			const responseBody = response.body

			expect(responseBody).toHaveProperty('id')
			expect(responseBody).toHaveProperty('username')
			expect(responseBody).toHaveProperty('firstname')
			expect(responseBody).toHaveProperty('lastname')
			expect(responseBody).toHaveProperty('email')
			expect(responseBody).toHaveProperty('phoneNumber')
			expect(responseBody).toHaveProperty('isEmailVerified')
			expect(responseBody).toHaveProperty('emailVerifiedAt')
			expect(responseBody).toHaveProperty('accountStatus')
			expect(responseBody).toHaveProperty('role')
			expect(responseBody).toHaveProperty('createdAt')
			expect(responseBody).toHaveProperty('updatedAt')
			expect(responseBody).not.toHaveProperty('password')
		})
	})

	describe('allow admin get user details by ID', () => {
		const getMeUrl = '/users/me'

		it('throw error if an unauthenticated user tries to access the endpoint', async () => {
			await CheckFailedAuthentication({ url: getMeUrl })
		})

		it('return their details', async () => {
			const email = randEmail()
			const { id } = await SigninUser({ email })
			const { access_token } = await SigninSuperAdmin()

			const response = await request(app.getHttpServer())
				.get(`${getUsersUrl}/${id}`)
				.set('Authorization', `Bearer ${access_token}`)
				.expect(200)

			const responseBody = response.body

			expect(responseBody.email).toEqual(email)
			expect(responseBody).toHaveProperty('id')
			expect(responseBody).toHaveProperty('username')
			expect(responseBody).toHaveProperty('firstname')
			expect(responseBody).toHaveProperty('lastname')
			expect(responseBody).toHaveProperty('email')
			expect(responseBody).toHaveProperty('phoneNumber')
			expect(responseBody).toHaveProperty('isEmailVerified')
			expect(responseBody).toHaveProperty('emailVerifiedAt')
			expect(responseBody).toHaveProperty('accountStatus')
			expect(responseBody).toHaveProperty('role')
			expect(responseBody).toHaveProperty('createdAt')
			expect(responseBody).toHaveProperty('updatedAt')
			expect(responseBody).not.toHaveProperty('password')
		})

		it('returns a 404 if no information for the specified id', async () => {
			const randomId = randUuid()
			const { access_token } = await SigninSuperAdmin()

			const response = await request(app.getHttpServer())
				.get(`${getUsersUrl}/${randomId}`)
				.set('Authorization', `Bearer ${access_token}`)
				.expect(404)

			expect(response.body.message).toEqual('User not found')
		})

		it('throw error if an invalid uuid is passed', async () => {
			const randomId = randUuid({ length: 7 })
			const { access_token } = await SigninSuperAdmin()

			const response = await request(app.getHttpServer())
				.get(`${getUsersUrl}/${randomId}`)
				.set('Authorization', `Bearer ${access_token}`)
				.expect(400)

			expect(response.body.message).toEqual(`Invalid id: ${randomId}`)
		})
	})

	describe('Create other backoffice users', () => {
		const url = '/users/backoffice/create'
		const email = randEmail({ nameSeparator: 'none' })
		const payload = {
			...SignupBackOfficeEditorPayload,
			email
		}

		it('throw error if an unauthenticated user tries to access the endpoint', async () => {
			await CheckFailedAuthentication({ url, method: 'post' })
		})

		it('throw error if unauthorised user tries to create a backoffice user', async () => {
			const { access_token } = await SigninUser({})

			const response = await request(app.getHttpServer())
				.post(url)
				.send()
				.set('Authorization', `Bearer ${access_token}`)
				.expect(401)

			expect(response.body.message).toEqual('Insufficient permissions')
		})

		it('throw error if required fields are not passed', async () => {
			const { access_token } = await SigninSuperAdmin()

			const response = await request(app.getHttpServer())
				.post(url)
				.send()
				.set('Authorization', `Bearer ${access_token}`)
				.expect(400)

			expect(response.body).toEqual(
				expect.objectContaining({
					message: expect.arrayContaining([
						"Role must be either 'admin' or 'editor'",
						'role should not be empty',
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
					])
				})
			)
		})

		it('successfully create a backoffice user', async () => {
			const { access_token } = await SigninSuperAdmin()

			const response = await request(app.getHttpServer())
				.post(url)
				.send(payload)
				.set('Authorization', `Bearer ${access_token}`)
				.expect(201)

			expect(response.body.message).toEqual(
				'Signup successful. Instructions on email verification has been sent to your email.'
			)
		})

		it('successfully create a backoffice user, activate and signin such user', async () => {
			const { access_token } = await SigninSuperAdmin()
			const otpCode = getMockedOtpCode()

			await request(app.getHttpServer())
				.post(url)
				.send(payload)
				.set('Authorization', `Bearer ${access_token}`)
				.expect(201)

			await request(app.getHttpServer())
				.patch(activateAccountUrl)
				.send({ otpCode, email })
				.expect(200)

			const response = await request(app.getHttpServer())
				.post(backOfficeSignin)
				.send({ email, password: payload.password })
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
})
