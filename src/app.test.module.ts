import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { AppModule } from './app.module'
import { setupTestDataSource } from '../test/testDatabase.setup'
import { MockCache } from '../test/mocks/cacheManager.mock'
import { OtpService } from '../src/services/otp.service'
import { generateRandomNumber } from './utils'

let testingModule: TestingModule
let testDataSource: DataSource
let mockedOtpCode: string
let mockCache: MockCache

export const buildTestingModule = async () => {
	if (testingModule) {
		return testingModule
	}

	mockedOtpCode = generateRandomNumber()
	mockCache = new MockCache()

	const OtpServiceMock = {
		generateOtp: jest.fn().mockReturnValue(mockedOtpCode)
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
			.overrideProvider('CACHE_MANAGER')
			.useValue(mockCache)
			.overrideProvider(OtpService)
			.useValue(OtpServiceMock)
			.compile()

		return testingModule
	} catch (error) {
		console.error('Error building testing module:', error)
		throw error
	}
}

export const getDataSource = () => testDataSource
export const getMockedOtpCode = () => mockedOtpCode
export const getMockCache = () => mockCache
