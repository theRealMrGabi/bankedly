import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TransactionService } from './transactions.service'
import { TransactionController } from './transactions.controller'
import { Transaction } from './entities/transaction.entity'
import { PaymentService } from '../services/payment.service'

@Module({
	imports: [TypeOrmModule.forFeature([Transaction])],
	controllers: [TransactionController],
	providers: [TransactionService, PaymentService]
})
export class TransactionModule {}
