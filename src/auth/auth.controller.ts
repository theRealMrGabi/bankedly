import { Controller, Post, Body, Patch } from '@nestjs/common'

import { AuthService } from './auth.service'
import { SignupDto } from './dto/signup.dto'
import { SigninDto } from './dto/signin.dto'
import { VerifyOtpDto } from './dto/verifyEmail.dto'

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
}
