import { SetMetadata } from '@nestjs/common'
import { UserRoles } from '../users/users.interface'

export const Roles = (roles: UserRoles[]) => SetMetadata('roles', roles)
