import { INestApplication } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { runSeeders } from 'typeorm-extension'

import UserSeeder from '../src/database/seeds/user.seeder'
import UserFactory from '../src/database/factories/user.factory'

import {
	buildTestingModule,
	getDataSource,
	getMockCache
} from '../src/app.test.module'
import { MockCache } from './mocks/cacheManager.mock'

let app: INestApplication
let dataSource: DataSource
let mockCache: MockCache
let seededData: any

async function saveSeededState(dataSource: DataSource) {
	const entities = dataSource.entityMetadatas
	const seededState = {}
	for (const entity of entities) {
		const repository = dataSource.getRepository(entity.name)
		seededState[entity.name] = await repository.find()
	}
	return seededState
}

async function resetToSeededState(dataSource: DataSource, seededState: any) {
	const entities = dataSource.entityMetadatas
	for (const entity of entities) {
		const repository = dataSource.getRepository(entity.name)
		await repository.clear()
		if (seededState[entity.name].length > 0) {
			await repository.insert(seededState[entity.name])
		}
	}
}

beforeAll(async () => {
	try {
		const moduleFixture = await buildTestingModule()

		dataSource = getDataSource()
		app = moduleFixture.createNestApplication()
		await runSeeders(dataSource, {
			seeds: [UserSeeder],
			factories: [UserFactory]
		})
		seededData = await saveSeededState(dataSource)
	} catch (error) {
		console.error('Error in beforeAll:', error)
	}
})

beforeEach(async () => {
	try {
		if (!dataSource.isInitialized) {
			await dataSource.initialize()
		}

		await app.init()

		mockCache = getMockCache()
	} catch (error) {
		console.error('Error in beforeAll:', error)
		throw error
	}
})

afterEach(async () => {
	try {
		if (dataSource && dataSource.isInitialized) {
			await resetToSeededState(dataSource, seededData)
		}

		if (app) {
			await app.close()
			mockCache.clear()
		}
	} catch (error) {
		console.error('Error in afterAll:', error)
		throw error
	}
})

afterAll(async () => {
	if (dataSource && dataSource.isInitialized) {
		await dataSource.destroy()
	}
})

export { app }

jest.mock('postmark', () => ({
	ServerClient: jest.fn(() => ({
		sendEmail: jest.fn()
	}))
}))

jest.mock('@slack/webhook', () => ({
	IncomingWebhook: jest.fn(() => ({
		send: jest.fn()
	}))
}))

jest.mock('cache-manager-redis-store', () => ({
	redisStore: jest.fn().mockResolvedValue({
		get: jest.fn(),
		set: jest.fn(),
		del: jest.fn()
	})
}))
