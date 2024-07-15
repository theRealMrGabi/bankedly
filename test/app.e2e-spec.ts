import { INestApplication } from '@nestjs/common'
import { DataSource } from 'typeorm'
import * as request from 'supertest'

import { buildTestingModule, getDataSource } from '../src/app.test.module'

describe('AppController (e2e)', () => {
	let app: INestApplication
	let dataSource: DataSource

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

	it('/ (GET)', async () => {
		try {
			await request(app.getHttpServer())
				.get('/')
				.expect(200)
				.expect('Welcome to Bankedly API Service')
		} catch (error) {
			console.error('Error in test:', error)
			throw error
		}
	})
})
