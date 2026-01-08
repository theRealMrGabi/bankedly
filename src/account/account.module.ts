import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AccountService } from './account.service'
import { AccountController } from './account.controller'
import { Account } from './entities/account.entity'
import { AuditLogEventService } from '../services/events'
import { AuditService } from '../services/auditLog.service'

@Module({
	imports: [TypeOrmModule.forFeature([Account])],
	controllers: [AccountController],
	providers: [AccountService, AuditLogEventService, AuditService],

	exports: [AccountService]
})
export class AccountModule {}
