import * as request from 'supertest'
import { app } from './setup'

describe('AppController (e2e)', () => {
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
