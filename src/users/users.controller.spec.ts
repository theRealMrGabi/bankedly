import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { usersMockProviders } from '../../test/mocks/users.mocks'

describe('UsersController', () => {
	let controller: UsersController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [UsersService, ...usersMockProviders]
		}).compile()

		controller = module.get<UsersController>(UsersController)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
