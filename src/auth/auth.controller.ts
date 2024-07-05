import { Controller, Post, Body, Patch, Query } from '@nestjs/common'

import { AuthService } from './auth.service'
import { SignupDto } from './dto/signup.dto'
import { SigninDto } from './dto/signin.dto'
import { VerifyOtpDto } from './dto/verifyEmail.dto'
import { EmailDto } from './dto/email.dto'
import { ResetPasswordDto } from './dto/resetPassword.dto'

@Controller({
	path: 'auth',
	version: '1'
})
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('/signup')
	async signupUser(@Body() body: SignupDto) {
		return await this.authService.signup(body)
	}

	@Post('/signin')
	async signin(@Body() body: SigninDto) {
		return await this.authService.signin(body)
	}

	@Patch('/activate')
	async activateAccount(@Body() body: VerifyOtpDto) {
		return await this.authService.activateAccount(body)
	}

	@Post('/forgot-password')
	async forgotPassword(@Body() body: EmailDto) {
		return await this.authService.forgotPassword(body)
	}

	@Patch('/reset-password')
	async resetPassword(
		@Query() email: EmailDto,
		@Body() body: ResetPasswordDto
	) {
		return await this.authService.resetPassword({
			emailDto: email,
			resetPasswordDto: body
		})
	}
}
