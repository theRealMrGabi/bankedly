import { Test, TestingModule } from '@nestjs/testing'
import { AccountService } from './account.service'
import { accountMockProviders } from '../../test/mocks/account.mocks'

describe('AccountService', () => {
	let service: AccountService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AccountService, ...accountMockProviders]
		}).compile()

		service = module.get<AccountService>(AccountService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})
