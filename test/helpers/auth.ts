import * as request from 'supertest'
import {
	randEmail,
	randFirstName,
	randLastName,
	randUserName
} from '@ngneat/falso'

import { app } from '../setup'
import { SignupDto } from '../../src/auth/dto/signup.dto'
import { EnvKeys, generateNigerianPhoneNumber } from '../../src/utils'
import { ConfigServiceSetup } from '../../src/config/config.service'
import { getMockedOtpCode } from '../../src/app.test.module'
import {
	signupUrl,
	activateAccountUrl,
	signinUrl,
	backOfficeSignin
} from '../auth.e2e-spec'
import { User } from '../../src/users/entities/user.entity'
import { UserRoles } from '../../src/users/users.interface'

type SigninResponse = User & {
	access_token: string
}

interface PartialSigninProps {
	email?: string
}

const configService = ConfigServiceSetup.getInstance()

export const signinPassword = 'r@ndom!?P@ssword123!'

export const SignupPayload = {
	firstname: randFirstName(),
	lastname: randLastName(),
	username: randUserName({ withAccents: false }).replace(/[^a-zA-Z0-9]/g, ''),
	password: signinPassword,
	phoneNumber: generateNigerianPhoneNumber()
} as SignupDto

export const SignupBackOfficeEditorPayload = {
	...SignupPayload,
	role: UserRoles.EDITOR
}

export const SignupUser = async ({
	email = randEmail()
}: PartialSigninProps) => {
	return await request(app.getHttpServer())
		.post(signupUrl)
		.send({ ...SignupPayload, email })
		.expect(201)
}

export const SigninUser = async ({
	email = randEmail()
}: PartialSigninProps) => {
	await SignupUser({ email })

	const otpCode = getMockedOtpCode()
	await request(app.getHttpServer())
		.patch(activateAccountUrl)
		.send({ otpCode, email })
		.expect(200)

	const response = await request(app.getHttpServer())
		.post(signinUrl)
		.send({
			email,
			password: signinPassword
		})
		.expect(201)

	const responseBody = response.body as SigninResponse

	return responseBody
}

export const SigninSuperAdmin = async () => {
	const payload = {
		email: configService.get(EnvKeys.ADMIN_SEEDED_EMAIL),
		password: configService.get(EnvKeys.ADMIN_SEEDED_PASSWORD)
	}

	const response = await request(app.getHttpServer())
		.post(backOfficeSignin)
		.send(payload)
		.expect(201)

	const responseBody = response.body as SigninResponse

	return responseBody
}

export const SigninBackofficeEditor = async () => {
	const email = randEmail({ nameSeparator: 'none' })

	const { access_token } = await SigninSuperAdmin()
	const otpCode = getMockedOtpCode()

	await request(app.getHttpServer())
		.post('/users/backoffice/create')
		.send({
			...SignupBackOfficeEditorPayload
		})
		.set('Authorization', `Bearer ${access_token}`)
		.expect(201)

	await request(app.getHttpServer())
		.patch(activateAccountUrl)
		.send({ otpCode, email })
		.expect(200)

	const response = await request(app.getHttpServer())
		.post(backOfficeSignin)
		.send({ email, password: signinPassword })
		.expect(201)

	const responseBody = response.body as SigninResponse

	return responseBody
}

export const CheckFailedAuthentication = async ({
	url,
	method = 'get'
}: {
	url: string
	method?: 'get' | 'post' | 'patch' | 'delete'
}) => {
	const response = await request(app.getHttpServer())[method](url).expect(401)
	expect(response.body.message).toEqual('Authentication failed')

	return response
}
