import { IsString, IsNotEmpty, Length, Matches } from 'class-validator'

export class VerifyOtpDto {
	@IsNotEmpty()
	@IsString()
	@Length(6, 6)
	@Matches(/^\d{6}$/, { message: 'otpCode must be a 6-digit number' })
	otpCode: string
}
