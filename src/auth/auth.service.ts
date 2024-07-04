import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { SignupDto } from './dto/signup.dto'

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService) {}

	async signup(sigupDto: SignupDto) {
		return this.usersService.create(sigupDto)
	}
}
