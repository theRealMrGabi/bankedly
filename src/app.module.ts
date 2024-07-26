import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager'

import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { ormConfig } from './config/ormconfig'
import { RedisConfig } from './config/redis'
import { AuthModule } from './auth/auth.module'
import { setupTestDataSource } from '../test/testDatabase.setup'

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
						console.log('Database connected successfully')
						return dataSource
					} catch (error) {
						console.error('Error connecting to database')
						throw error
					}
				} else {
					return setupTestDataSource()
				}
			}
		}),
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
				whitelist: true
			})
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: CacheInterceptor
		}
	]
})
export class AppModule {}
