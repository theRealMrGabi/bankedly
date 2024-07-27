import { INestApplication } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { buildTestingModule, getDataSource } from '../src/app.test.module'

let app: INestApplication
let dataSource: DataSource

async function truncateAllTables(dataSource: DataSource) {
	const entities = dataSource.entityMetadatas
	for (const entity of entities) {
		const repository = dataSource.getRepository(entity.name)
		await repository.query(`TRUNCATE "${entity.tableName}" CASCADE;`)
	}
}

beforeEach(async () => {
	try {
		const moduleFixture = await buildTestingModule()
		dataSource = getDataSource()

		if (!dataSource.isInitialized) {
			await dataSource.initialize()
		}

		app = moduleFixture.createNestApplication()
		await app.init()
	} catch (error) {
		console.error('Error in beforeAll:', error)
		throw error
	}
})

afterEach(async () => {
	try {
		if (dataSource && dataSource.isInitialized) {
			await truncateAllTables(dataSource)
		}

		if (app) {
			await app.close()
		}

		if (dataSource && dataSource.isInitialized) {
			await dataSource.destroy()
		}
	} catch (error) {
		console.error('Error in afterAll:', error)
		throw error
	}
})

export { app }

jest.mock('postmark', () => ({
	ServerClient: jest.fn(() => ({
		sendEmail: jest.fn()
	}))
}))

jest.mock('cache-manager-redis-store', () => ({
	redisStore: jest.fn().mockResolvedValue({
		get: jest.fn(),
		set: jest.fn(),
		del: jest.fn()
	})
}))
