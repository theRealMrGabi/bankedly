import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { AppModule } from './app.module'
import { setupTestDataSource } from '../test/testDatabase.setup'

let testingModule: TestingModule
let testDataSource: DataSource

export const buildTestingModule = async () => {
	if (testingModule) {
		return testingModule
	}

	try {
		testDataSource = await setupTestDataSource()
		testingModule = await Test.createTestingModule({
			imports: [
				TypeOrmModule.forRoot({
					name: 'default',
					synchronize: true
				}),
				AppModule
			]
		})
			.overrideProvider(DataSource)
			.useValue(testDataSource)
			.compile()

		return testingModule
	} catch (error) {
		console.error('Error building testing module:', error)
		throw error
	}
}

export const getDataSource = () => testDataSource
