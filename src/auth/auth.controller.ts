import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignupDto } from './dto/signup.dto'

@Controller({
	path: 'auth',
	version: '1'
})
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('/signup')
	async signupUser(@Body() body: SignupDto) {
		await this.authService.signup(body)
		return {
			message:
				'Signup successful. Instructions on email verification has been sent to your email.'
		}
	}
}
