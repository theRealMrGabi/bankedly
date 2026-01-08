import { TransactionService } from '../../src/transactions/transactions.service'
import { transactionServiceMock } from './mocks.setup'

export const transactionMockProviders = [
	{
		provide: TransactionService,
		useValue: transactionServiceMock
	}
]
