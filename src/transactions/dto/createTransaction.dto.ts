import {
	IsString,
	IsUUID,
	IsNumber,
	ValidateNested,
	IsNotEmpty,
	IsEnum
} from 'class-validator'
import { Type } from 'class-transformer'

import {
	TransactionGateway,
	TransactionType,
	TransactionStatus
} from '../transactions.interface'

class TransactionDetailDto {
	@IsNotEmpty()
	@IsEnum(TransactionGateway)
	gateway: TransactionGateway

	@IsNotEmpty()
	@IsString()
	receiverAccountNumber: string
}

export class CreateTransactionDto {
	@IsNotEmpty()
	@IsUUID()
	userId: string

	@IsNotEmpty()
	@IsString()
	reference: string

	@IsNotEmpty()
	@IsUUID()
	accountId: string

	@IsNotEmpty()
	@IsNumber()
	amount: number

	@ValidateNested()
	@Type(() => TransactionDetailDto)
	detail: TransactionDetailDto

	@IsNotEmpty()
	@IsEnum(TransactionType)
	type: TransactionType

	@IsNotEmpty()
	@IsEnum(TransactionStatus)
	status: TransactionStatus
}
