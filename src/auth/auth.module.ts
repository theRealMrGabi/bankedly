import { Module, forwardRef } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { PostMarkService } from '../services/postmark.service'
import { EmailEventHandlerService } from '../services/email-event-handler.service'
import { OtpService } from '../services/otp.service'
import { getJwtModuleOptions } from '../config/jwt.config'
import { AuditService } from '../services/auditLog.service'

@Module({
	// imports: [UsersModule, JwtModule.registerAsync(getJwtModuleOptions())],
	imports: [
		forwardRef(() => UsersModule),
		JwtModule.registerAsync(getJwtModuleOptions())
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		PostMarkService,
		EmailEventHandlerService,
		OtpService,
		AuditService
	],
	exports: [AuthService]
})
export class AuthModule {}
