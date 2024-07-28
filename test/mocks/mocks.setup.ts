import { Cache } from 'cache-manager'
import { JwtService } from '@nestjs/jwt'
import { EventEmitter2 } from '@nestjs/event-emitter'

import { UsersService } from '../../src/users/users.service'
import { generateRandomNumber } from '../../src/utils'

export const cacheManagerMock = {
	get: jest.fn(),
	set: jest.fn(),
	del: jest.fn()
} as unknown as Cache

export const jwtServiceMock = {
	signAsync: jest.fn()
}

export const eventEmitterMock = {
	emit: jest.fn()
}

export const usersServiceMock = {
	create: jest.fn(),
	findById: jest.fn(),
	findByEmail: jest.fn(),
	find: jest.fn(),
	remove: jest.fn(),
	updateUser: jest.fn()
}

export const OtpServiceMock = {
	generateOtp: jest.fn().mockImplementation(() => generateRandomNumber())
}

export const commonProviders = [
	{
		provide: 'CACHE_MANAGER',
		useValue: cacheManagerMock
	},
	{
		provide: JwtService,
		useValue: jwtServiceMock
	},
	{
		provide: EventEmitter2,
		useValue: eventEmitterMock
	},
	{
		provide: UsersService,
		useValue: usersServiceMock
	}
]
