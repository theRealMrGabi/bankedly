import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { DataSource, DataSourceOptions } from 'typeorm'
import { EnvKeys } from '../utils'

const configService = new ConfigService()

const isTestEnvironment = process.env.NODE_ENV === 'test'
const isDevEnvironment = process.env.NODE_ENV === 'development'

export const ormConfig = (
	configService: ConfigService
): TypeOrmModuleOptions => ({
	type: 'postgres',
	host: configService.get(EnvKeys.DB_HOST),
	port: +configService.get(EnvKeys.DB_PORT),
	username: configService.get(EnvKeys.DB_USERNAME),
	password: configService.get(EnvKeys.DB_PASSWORD),
	database: configService.get(EnvKeys.DB_NAME),
	synchronize: false,
	logging: isDevEnvironment,
	entities: isTestEnvironment ? ['**/*.entity.ts'] : ['**/*.entity.js'],
	migrations: ['src/migration/**/*.js']
})

export const dataSourceoptions: DataSourceOptions = {
	type: 'postgres',
	host: configService.get(EnvKeys.DB_HOST),
	port: +configService.get(EnvKeys.DB_PORT),
	username: configService.get(EnvKeys.DB_USERNAME),
	password: configService.get(EnvKeys.DB_PASSWORD),
	database: configService.get(EnvKeys.DB_NAME),
	synchronize: false,
	logging: isDevEnvironment,
	entities: isTestEnvironment ? ['**/*.entity.ts'] : ['**/*.entity.js'],
	migrations: ['src/migration/**/*.js']
} satisfies TypeOrmModuleOptions

export const AppDataSource = new DataSource(dataSourceoptions)
