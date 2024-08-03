import { ConfigService, ConfigModule } from '@nestjs/config'
import { JwtModuleOptions, JwtModuleAsyncOptions } from '@nestjs/jwt'
import { EnvKeys } from '../utils'

const getJwtConfig = (configService: ConfigService): JwtModuleOptions => ({
	secret: configService.get<string>(EnvKeys.JWT_TOKEN),
	signOptions: {
		expiresIn: '1h',
		issuer: configService.get<string>(EnvKeys.JWT_ISSUER)
	}
})

const getJwtModuleOptions = (): JwtModuleAsyncOptions => ({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: async (configService: ConfigService) =>
		getJwtConfig(configService)
})

export { getJwtConfig, getJwtModuleOptions }
