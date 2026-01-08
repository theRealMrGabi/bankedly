import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TransactionService } from './transactions.service'
import { TransactionController } from './transactions.controller'
import { Transaction } from './entities/transaction.entity'
import { PaymentService } from '../services/payment.service'
import { AccountModule } from '../account/account.module'
import { AuditLogEventService } from '../services/events'
import { AuditService } from '../services/auditLog.service'

@Module({
	imports: [TypeOrmModule.forFeature([Transaction]), AccountModule],
	controllers: [TransactionController],
	providers: [
		TransactionService,
		PaymentService,
		AuditLogEventService,
		AuditService
	]
})
export class TransactionModule {}
