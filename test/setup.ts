import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '../src/app.module'

let app: INestApplication

beforeEach(async () => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule]
	}).compile()

	app = moduleFixture.createNestApplication()
	await app.init()
})

afterEach(async () => {
	jest.clearAllMocks()
	await app.close()
})

jest.mock('postmark', () => ({
	ServerClient: jest.fn(() => ({
		sendEmail: jest.fn()
	}))
}))
