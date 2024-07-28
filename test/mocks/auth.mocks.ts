import { JwtService } from '@nestjs/jwt'
import { EventEmitter2 } from '@nestjs/event-emitter'

import { UsersService } from '../../src/users/users.service'
import { OtpService } from '../../src/services/otp.service'
import {
	jwtServiceMock,
	cacheManagerMock,
	usersServiceMock,
	eventEmitterMock,
	OtpServiceMock
} from './mocks.setup'

export const authMockProviders = [
	{
		provide: JwtService,
		useValue: jwtServiceMock
	},
	{
		provide: 'CACHE_MANAGER',
		useValue: cacheManagerMock
	},
	{
		provide: UsersService,
		useValue: usersServiceMock
	},
	{
		provide: EventEmitter2,
		useValue: eventEmitterMock
	},
	{
		provide: OtpService,
		useValue: OtpServiceMock
	}
]
