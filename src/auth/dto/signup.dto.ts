import {
	IsString,
	IsEmail,
	IsPhoneNumber,
	Matches,
	IsNotEmpty
} from 'class-validator'

export class SignupDto {
	@IsNotEmpty()
	@IsString()
	@Matches(/^[a-zA-Z0-9]+$/, {
		message:
			'Username can only be alphabets or alphanumeric. No symbol or signs is allowed'
	})
	username: string

	@IsNotEmpty()
	@IsString()
	@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*?])(.{8,})$/, {
		message:
			'Password must contain lowercase, uppercase, number, special character and must be minumum of 8 characters'
	})
	password: string

	@IsNotEmpty()
	@IsString()
	firstname: string

	@IsNotEmpty()
	@IsString()
	lastname: string

	@IsNotEmpty()
	@IsEmail()
	email: string

	@IsPhoneNumber('NG')
	@Matches(/^([+234]{4})[0-9]{10}$/, {
		message: 'Phone number must match this format +2348023456789'
	})
	phoneNumber: string
}
