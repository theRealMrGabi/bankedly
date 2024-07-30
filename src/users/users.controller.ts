import { Controller, Get, Query } from '@nestjs/common'

import { UsersService } from './users.service'
import { User } from './entities/user.entity'
import { NoCache } from '../interceptors/NoCache'
import { PaginationQueryDto } from '../common/dto/pagination.dto'
import { SortingParams } from '../common/decorators/sort-decorator'

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
	constructor(private readonly usersService: UsersService) {}

	@Get()
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
}
