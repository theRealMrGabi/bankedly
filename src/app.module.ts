import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_PIPE, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { CacheModule } from '@nestjs/cache-manager'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { JwtModule } from '@nestjs/jwt'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { ormConfig } from './config/ormconfig'
import { RedisConfig } from './config/redis'
import { AuthModule } from './auth/auth.module'
import { setupTestDataSource } from '../test/testDatabase.setup'
import { CustomCacheInterceptor } from './interceptors/CacheInterceptor'
import { AuthGuard } from './common/guards/auth.guard'
import { getJwtModuleOptions } from './config/jwt.config'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `.env.${process.env.NODE_ENV}`
		}),
		CacheModule.registerAsync(RedisConfig),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			// useFactory: (configService: ConfigService) => ormConfig(configService),
			useFactory: () => ormConfig(),
			dataSourceFactory: async (options) => {
				if (process.env.NODE_ENV !== 'test') {
					try {
						const dataSource = await new DataSource(options).initialize()
						console.log('🍀 Database connected successfully 🍀')
						return dataSource
					} catch (error) {
						console.error('🚨 Error connecting to database 🚨')
						throw error
					}
				} else {
					return setupTestDataSource()
				}
			}
		}),
		JwtModule.registerAsync(getJwtModuleOptions()),
		EventEmitterModule.forRoot(),
		UsersModule,
		AuthModule
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_PIPE,
			useValue: new ValidationPipe({
				whitelist: true,
				transform: true
			})
		},
		{
			provide: APP_INTERCEPTOR,
			// useClass: CacheInterceptor
			useClass: CustomCacheInterceptor
		},
		{
			provide: APP_GUARD,
			useClass: AuthGuard
		}
	]
})
export class AppModule {}
