import { Controller, Post, Body } from '@nestjs/common'
import { UsersService } from './users.service'
import { SignupDto } from '../auth/dto/signup.dto'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	create(@Body() createUserDto: SignupDto) {
		return this.usersService.create(createUserDto)
	}
}
