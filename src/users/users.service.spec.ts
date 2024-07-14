import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { usersMockProviders } from '../../test/mocks/users.mocks'

describe('UsersService', () => {
	let service: UsersService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [UsersService, ...usersMockProviders]
		}).compile()

		service = module.get<UsersService>(UsersService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})
