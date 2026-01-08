import { Test, TestingModule } from '@nestjs/testing'
import { AccountController } from './account.controller'
import { AccountService } from './account.service'
import { accountMockProviders } from '../../test/mocks/account.mocks'

describe('AccountController', () => {
	let controller: AccountController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AccountController],
			providers: [AccountService, ...accountMockProviders]
		}).compile()

		controller = module.get<AccountController>(AccountController)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
