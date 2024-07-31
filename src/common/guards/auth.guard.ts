import {
	ExecutionContext,
	CanActivate,
	Injectable,
	UnauthorizedException,
	Inject
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Reflector } from '@nestjs/core'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'

import { UsersService } from '../../users/users.service'
import { RedisKeys, extractTokenFromHeader } from '../../utils'
import { User } from '../../users/entities/user.entity'

import { IS_PUBLIC_KEY } from '../../interceptors/public-route.interceptor'

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private jwtService: JwtService,
		private usersService: UsersService,
		private reflector: Reflector
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass()
		])

		if (isPublic) {
			return true
		}

		const request = context.switchToHttp().getRequest()
		const token = extractTokenFromHeader(request.headers['authorization'])

		if (!token) {
			throw new UnauthorizedException('Authentication failed')
		}

		const isBlacklistedToken = await this.cacheManager.get(
			`${RedisKeys.BLACKLIST_TOKEN}_${token}`
		)

		if (isBlacklistedToken) {
			throw new UnauthorizedException('Authentication failed')
		}

		try {
			const payload = await this.jwtService.verifyAsync(token)

			const userId = payload.id

			let user: User = await this.cacheManager.get(
				`${RedisKeys.USER}_${userId}`
			)

			if (!user) {
				user = await this.usersService.findById(userId)

				if (!user) {
					throw new UnauthorizedException('Authentication failed')
				}

				await this.cacheManager.set(
					`${RedisKeys.USER}_${userId}`,
					user,
					RedisKeys.CACHE_TTL
				)
			}

			request['user'] = user
		} catch (error) {
			throw new UnauthorizedException('Invalid authentication token')
		}

		return true
	}
}
