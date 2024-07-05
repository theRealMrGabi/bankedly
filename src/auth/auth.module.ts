import { Module } from '@nestjs/common'
import { ConfigService, ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { EnvKeys } from '../utils'
import { PostMarkService } from '../services/postmark.service'
import { EmailEventHandlerService } from '../services/email-event-handler.service'

@Module({
	imports: [
		UsersModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>(EnvKeys.JWT_TOKEN),
				signOptions: {
					expiresIn: '1h',
					issuer: configService.get<string>(EnvKeys.JWT_ISSUER)
				}
			})
		})
	],
	controllers: [AuthController],
	providers: [AuthService, PostMarkService, EmailEventHandlerService]
})
export class AuthModule {}
