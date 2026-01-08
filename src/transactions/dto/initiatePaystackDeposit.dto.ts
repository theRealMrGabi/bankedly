import { IsUUID, IsNumber, IsNotEmpty } from 'class-validator'

export class InitiatePaystackDepositDto {
	@IsNotEmpty()
	@IsUUID()
	accountId: string

	@IsNotEmpty()
	@IsNumber()
	amount: number
}
