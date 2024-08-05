import { IsEnum, IsOptional } from 'class-validator'

import { PaginationAndFilter } from '../interface/utils.interface'
import { PaginationQueryDto } from '../common/dto/pagination.dto'
import { Account } from './entities/account.entity'

export enum AccountType {
	CURRENT_ACCOUNT = 'current_account',
	SAVINGS_ACCOUNT = 'savings_account',
	CORPORATE_ACCOUNT = 'corporate_account'
}

export enum AccountStatus {
	ACTIVE = 'active',
	DORMANT = 'dormant',
	FROZEN = 'frozen',
	UNDER_REVIEW = 'under_review'
}

export interface AccountPagination extends PaginationAndFilter<Account> {
	status?: AccountStatus
	type?: AccountType
}

export class AccountPaginationQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsEnum(AccountStatus)
	status?: AccountStatus

	@IsOptional()
	@IsEnum(AccountType)
	type?: AccountType
}
