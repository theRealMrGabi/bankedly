import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager'

import {
	Injectable,
	ExecutionContext,
	CallHandler,
	Inject
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { Reflector } from '@nestjs/core'

import { NO_CACHE_KEY } from './NoCache'

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
	constructor(@Inject(CACHE_MANAGER) cacheManager: any, reflector: Reflector) {
		super(cacheManager, reflector)
	}

	trackBy(context: ExecutionContext): string | undefined {
		const noCache = this.reflector.get<boolean>(
			NO_CACHE_KEY,
			context.getHandler()
		)
		if (noCache) {
			return undefined
		}
		return super.trackBy(context)
	}

	async intercept(
		context: ExecutionContext,
		next: CallHandler
	): Promise<Observable<any>> {
		const noCache =
			this.reflector.get<boolean>(NO_CACHE_KEY, context.getHandler()) ||
			this.reflector.get<boolean>(NO_CACHE_KEY, context.getClass())
		if (noCache) {
			return next.handle()
		}
		return super.intercept(context, next)
	}
}
