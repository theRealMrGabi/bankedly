import { Test, TestingModule } from '@nestjs/testing'
import { TransactionService } from './transactions.service'
import { transactionMockProviders } from '../../test/mocks/transactions.mocks'

describe('TransactionService', () => {
	let service: TransactionService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TransactionService, ...transactionMockProviders]
		}).compile()

		service = module.get<TransactionService>(TransactionService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})
