import {
	randEmail,
	randFirstName,
	randLastName,
	randUserName,
	randPhoneNumber
} from '@ngneat/falso'
import { SignupDto } from '../../src/auth/dto/signup.dto'
import { SigninDto } from '../../src/auth/dto/signin.dto'

export const SignupPayload = {
	email: randEmail(),
	firstname: randFirstName(),
	lastname: randLastName(),
	username: randUserName(),
	password: 'r@ndom!?P@ssword123!',
	phoneNumber: randPhoneNumber({ countryCode: 'NG' })
} satisfies SignupDto

const { email, password } = SignupPayload

export const SigninPayload = {
	email,
	password
} satisfies SigninDto
