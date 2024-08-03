import { UsersService } from '../../src/users/users.service'
import { AuthService } from '../../src/auth/auth.service'
import { usersServiceMock, authServiceMock } from './mocks.setup'

export const usersMockProviders = [
	{
		provide: UsersService,
		useValue: usersServiceMock
	},
	{
		provide: AuthService,
		useValue: authServiceMock
	}
]
