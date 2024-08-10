import { AccountService } from '../../src/account/account.service'
import { accountServiceMock } from './mocks.setup'

export const accountMockProviders = [
	{
		provide: AccountService,
		useValue: accountServiceMock
	}
]
