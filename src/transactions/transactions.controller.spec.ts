import { Test, TestingModule } from '@nestjs/testing'
import { TransactionController } from './transactions.controller'
import { TransactionService } from './transactions.service'
import { transactionMockProviders } from '../../test/mocks/transactions.mocks'

describe('TransactionController', () => {
	let controller: TransactionController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TransactionController],
			providers: [TransactionService, ...transactionMockProviders]
		}).compile()

		controller = module.get<TransactionController>(TransactionController)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
