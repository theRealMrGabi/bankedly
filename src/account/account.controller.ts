import {
	Controller,
	Post,
	Body,
	UseGuards,
	Get,
	Query,
	Param,
	NotFoundException
} from '@nestjs/common'

import { Account } from './entities/account.entity'
import { User } from '../users/entities/user.entity'
import { AccountService } from './account.service'
import { CreateAccountDto } from './dto/account.dto'
import { AccountPaginationQueryDto } from './account.interface'

import { NoCache } from '../interceptors/NoCache'
import { RoleGuard } from '../common/guards/role.guard'
import { UserRoles } from '../users/users.interface'
import { Roles } from '../interceptors/roles.interceptor'
import { UUIDValidationPipe } from '../pipes/uuid-validation.pipe'
import { SortingParams } from '../decorators/sort-decorator'
import { GetUser } from '../decorators/user.decorator'

const accountSortFields = [
	'id',
	'accountNumber',
	'balance',
	'createdAt',
	'updatedAt'
]

@NoCache()
@Controller({
	path: 'accounts',
	version: '1'
})
export class AccountController {
	constructor(private readonly accountService: AccountService) {}

	@Post()
	@UseGuards(RoleGuard)
	@Roles([UserRoles.CUSTOMER])
	async createAccount(@GetUser() user: User, @Body() body: CreateAccountDto) {
		return await this.accountService.createAccount({
			createAccountDto: body,
			user
		})
	}

	@Get()
	@UseGuards(RoleGuard)
	@Roles([UserRoles.ADMIN, UserRoles.CUSTOMER])
	async getAccounts(
		@Query() query: AccountPaginationQueryDto,
		@SortingParams(accountSortFields)
		sort?: {
			sort?: keyof Account
		}
	) {
		return await this.accountService.getAccounts({
			...query,
			sort: sort?.sort
		})
	}

	@Get('/me')
	@UseGuards(RoleGuard)
	@Roles([UserRoles.CUSTOMER])
	async getAccountsByUserId(@GetUser() user: User) {
		const userId = user.id

		const account = await this.accountService.findByUserId(userId)

		if (!account) {
			throw new NotFoundException('Account not found')
		}

		return account
	}

	@Get('/user/:id')
	@UseGuards(RoleGuard)
	@Roles([UserRoles.ADMIN, UserRoles.EDITOR])
	async backofficeGetAccountsByUserId(
		@Param('id', UUIDValidationPipe) id: string
	) {
		const account = await this.accountService.findByUserId(id)

		if (!account) {
			throw new NotFoundException('Account not found')
		}

		return account
	}

	@Get('/:id')
	@UseGuards(RoleGuard)
	@Roles([UserRoles.ADMIN, UserRoles.EDITOR])
	async getAccountById(@Param('id', UUIDValidationPipe) id: string) {
		const account = await this.accountService.findById(id)

		if (!account) {
			throw new NotFoundException('Account not found')
		}

		return account
	}
}
