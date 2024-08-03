import { Test, TestingModule } from '@nestjs/testing'

import { AuthService } from './auth.service'
import { authMockProviders } from '../../test/mocks/auth.mocks'

describe('AuthService', () => {
	let service: AuthService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AuthService, ...authMockProviders]
		}).compile()

		service = module.get<AuthService>(AuthService)
	})

	it('should be defineds', () => {
		expect(service).toBeDefined()
	})
})
