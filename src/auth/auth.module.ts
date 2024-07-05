import { Module } from '@nestjs/common'
import { ConfigService, ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { AuthConstants } from '../utils'
import { PostMarkService } from '../postmark.service'

@Module({
	imports: [
		UsersModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get(AuthConstants.JWT_TOKEN),
				signOptions: {
					expiresIn: '1h'
				}
			})
		})
	],
	controllers: [AuthController],
	providers: [AuthService, PostMarkService]
})
export class AuthModule {}
