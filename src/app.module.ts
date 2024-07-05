import { Module, ValidationPipe } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { ormConfig } from './config/ormconfig'
import { RedisConfig } from './config/redis'
import { AuthModule } from './auth/auth.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `.env.${process.env.NODE_ENV}`
		}),
		CacheModule.registerAsync(RedisConfig),
		// CacheModule.registerAsync({
		// 	imports: [ConfigModule],
		// 	useClass: RedisConfig,
		// 	inject: [ConfigService]
		// }),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ormConfig(configService)
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
