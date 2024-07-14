import { UsersService } from '../../src/users/users.service'
import { usersServiceMock } from './mocks.setup'

export const usersMockProviders = [
	{
		provide: UsersService,
		useValue: usersServiceMock
	}
]
