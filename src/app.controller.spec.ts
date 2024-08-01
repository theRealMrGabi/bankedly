import { Test, TestingModule } from '@nestjs/testing'
import { TerminusModule } from '@nestjs/terminus'

import { AppController } from './app.controller'
import { AppService } from './app.service'

describe('AppController', () => {
	let appController: AppController

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			imports: [TerminusModule],
			controllers: [AppController],
			providers: [AppService]
		}).compile()

		appController = app.get<AppController>(AppController)
	})

	describe('root', () => {
		it('should return "Welcome to Bankedly API Service"', () => {
			expect(appController.getHello()).toBe('Welcome to Bankedly API Service')
		})
	})
})
