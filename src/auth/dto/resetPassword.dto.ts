import { IsString, IsNotEmpty, Length, Matches } from 'class-validator'

export class ResetPasswordDto {
	@IsNotEmpty()
	@IsString()
	@Length(6, 6)
	@Matches(/^\d{6}$/, { message: 'otpCode must be a 6-digit number' })
	otpCode: string

	@IsNotEmpty()
	@IsString()
	@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*?])(.{8,})$/, {
		message:
			'Password must contain lowercase, uppercase, number, special character and must be minumum of 8 characters'
	})
	password: string
}
