import * as request from 'supertest'
import {
	randEmail,
	randFirstName,
	randLastName,
	randUserName
} from '@ngneat/falso'

import { app } from '../setup'
import { SignupDto } from '../../src/auth/dto/signup.dto'
import { SigninDto } from '../../src/auth/dto/signin.dto'
import { generateNigerianPhoneNumber } from '../../src/utils'

export const SignupPayload = {
	email: randEmail(),
	firstname: randFirstName(),
	lastname: randLastName(),
	username: randUserName({ withAccents: false }).replace(/[^a-zA-Z0-9]/g, ''),
	password: 'r@ndom!?P@ssword123!',
	phoneNumber: generateNigerianPhoneNumber()
} satisfies SignupDto

const { email, password } = SignupPayload

export const SigninPayload = {
	email,
	password
} satisfies SigninDto

export const SignupUser = async () => {
	return await request(app.getHttpServer())
		.post('/auth/signup')
		.send(SignupPayload)
		.expect(201)
}
