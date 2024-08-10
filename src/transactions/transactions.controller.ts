import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	UseGuards,
	Query
} from '@nestjs/common'

import { NoCache } from '../interceptors/NoCache'
import { TransactionService } from './transactions.service'
import { InitiatePaystackDepositDto } from './dto/initiatePaystackDeposit.dto'
import { GetUser } from '../decorators/user.decorator'
import { User } from '../users/entities/user.entity'
import { RoleGuard } from '../common/guards/role.guard'
import { UserRoles } from '../users/users.interface'
import { Roles } from '../interceptors/roles.interceptor'
import { UUIDValidationPipe } from '../pipes/uuid-validation.pipe'

@NoCache()
@Controller({
	path: 'transactions',
	version: '1'
})
export class TransactionController {
	constructor(private readonly transactionService: TransactionService) {}

	@Post('/initiate-paystack-deposit')
	async initiatePaystackDeposit(
		@GetUser() user: User,
		@Body() body: InitiatePaystackDepositDto
	) {
		return this.transactionService.initiatePaystackDeposit({
			initiatePaystackDepositDto: body,
			user
		})
	}

	@Get('/reference/:id')
	@UseGuards(RoleGuard)
	@Roles([UserRoles.ADMIN, UserRoles.EDITOR])
	async fetchTransactionByReference(
		@Param('id', UUIDValidationPipe) id: string
	) {
		return await this.transactionService.fetchTransactionByReference(id)
	}

	@Get('/verify-paystack-deposit')
	@UseGuards(RoleGuard)
	@Roles([UserRoles.ADMIN, UserRoles.EDITOR])
	async verifyPaystackDeposit(
		@Query('reference', UUIDValidationPipe) reference: string
	) {
		return await this.transactionService.verifyPaystackDeposit(reference)
	}
}
