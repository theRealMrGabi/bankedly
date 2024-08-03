import {
	Controller,
	Get,
	Query,
	Param,
	NotFoundException,
	UseGuards,
	Post,
	Body
} from '@nestjs/common'

import { UsersService } from './users.service'
import { User } from './entities/user.entity'
import { NoCache } from '../interceptors/NoCache'
import { PaginationQueryDto } from '../common/dto/pagination.dto'
import { SortingParams } from '../decorators/sort-decorator'
import { GetUser } from '../decorators/user.decorator'
import { UUIDValidationPipe } from '../pipes/uuid-validation.pipe'
import { Serialize } from '../common/interceptors/serialize.interceptor'
import { UserDto } from './dto/user.dto'
import { AdminGuard } from '../common/guards/admin.guard'
import { Roles } from '../interceptors/roles.interceptor'
import { UserRoles } from './users.interface'
import { CreateBackOfficeStaffDto } from './dto/createBackofficeStaff.dto'
import { AuthService } from '../auth/auth.service'

const userSortFields = [
	'id',
	'username',
	'firstname',
	'lastname',
	'email',
	'phoneNumber',
	'isEmailVerified',
	'emailVerifiedAt',
	'accountStatus',
	'role',
	'createdAt',
	'updatedAt'
]

@NoCache()
@Controller({
	path: 'users',
	version: '1'
})
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private authService: AuthService
	) {}

	@Get()
	@UseGuards(AdminGuard)
	@Roles([UserRoles.ADMIN])
	async getUsers(
		@Query() query: PaginationQueryDto,
		@SortingParams(userSortFields)
		sort?: {
			sort?: keyof User
		}
	) {
		return await this.usersService.findUsers({
			...query,
			sort: sort?.sort
		})
	}

	@Get('/me')
	@Serialize(UserDto)
	async getCurrentUser(@GetUser() user: User) {
		const userId = user.id
		const response = await this.usersService.findById(userId)

		if (!response) {
			throw new NotFoundException('User not found')
		}

		return response
	}

	@Get('/:id')
	@Serialize(UserDto)
	@UseGuards(AdminGuard)
	@Roles([UserRoles.ADMIN, UserRoles.EDITOR])
	async getUserById(@Param('id', UUIDValidationPipe) id: string) {
		const user = await this.usersService.findById(id)

		if (!user) {
			throw new NotFoundException('User not found')
		}

		return user
	}

	@Post('/backoffice/create')
	@UseGuards(AdminGuard)
	@Roles([UserRoles.ADMIN])
	async createBackofficeStaff(
		@GetUser() user: User,
		@Body() body: CreateBackOfficeStaffDto
	) {
		return await this.authService.createBackOfficeStaff({
			payload: body,
			admin: user
		})
	}
}
