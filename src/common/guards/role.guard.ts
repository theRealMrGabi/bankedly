import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRoles } from '../../users/users.interface'
import { User } from '../../users/entities/user.entity'

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const allowedRoles =
			this.reflector.get<UserRoles[]>('roles', context.getHandler()) || []
		const request = context.switchToHttp().getRequest()
		const user: User = request.user

		if (!user || !allowedRoles.includes(user.role as UserRoles)) {
			throw new UnauthorizedException('Insufficient permissions')
		}

		return true
	}
}
