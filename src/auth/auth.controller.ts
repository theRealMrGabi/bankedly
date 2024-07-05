import { Controller, Post, Body } from '@nestjs/common'

import { AuthService } from './auth.service'
import { SignupDto } from './dto/signup.dto'
import { SigninDto } from './dto/signin.dto'

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
}
