import { CacheModuleAsyncOptions } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-store'
import { EnvKeys } from '../utils'

export const RedisConfig: CacheModuleAsyncOptions = {
	isGlobal: true,
	imports: [ConfigModule],
	useFactory: async (configService: ConfigService) => {
		const store = await redisStore({
			url: configService.get<string>(EnvKeys.REDIS_URL),
			ttl: configService.get<number>(EnvKeys.REDIS_TTL)
			// socket: {
			// 	host: configService.get<string>('REDIS_HOST'),
			// 	port: parseInt(configService.get<string>('REDIS_PORT')!)
			// }
		})
		return {
			store: () => store
		}
	},
	inject: [ConfigService]
}
