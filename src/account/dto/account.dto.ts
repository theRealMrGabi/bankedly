import { IsNotEmpty, IsEnum } from 'class-validator'
import { AccountType } from '../account.interface'

export class CreateAccountDto {
	@IsNotEmpty()
	@IsEnum(AccountType)
	type: AccountType
}
