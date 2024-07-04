import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { DataSource, DataSourceOptions } from 'typeorm'
import { DatabaseConstants } from '../utils'

const configService = new ConfigService()

export const ormConfig = (
	configService: ConfigService
): TypeOrmModuleOptions => ({
	type: 'postgres',
	host: configService.get(DatabaseConstants.DB_HOST),
	port: +configService.get(DatabaseConstants.DB_PORT),
	username: configService.get(DatabaseConstants.DB_USERNAME),
	password: configService.get(DatabaseConstants.DB_PASSWORD),
	database: configService.get(DatabaseConstants.DB_NAME),
	synchronize: false,
	logging: true,
	entities:
		process.env.NODE_ENV === 'test' ? ['**/*.entity.ts'] : ['**/*.entity.js'],
	migrations: ['src/migration/**/*.js']
})

export const dataSourceoptions: DataSourceOptions = {
	type: 'postgres',
	host: configService.get(DatabaseConstants.DB_HOST),
	port: +configService.get(DatabaseConstants.DB_PORT),
	username: configService.get(DatabaseConstants.DB_USERNAME),
	password: configService.get(DatabaseConstants.DB_PASSWORD),
	database: configService.get(DatabaseConstants.DB_NAME),
	synchronize: false,
	logging: true,
	entities:
		process.env.NODE_ENV === 'test' ? ['**/*.entity.ts'] : ['**/*.entity.js'],
	migrations: ['src/migration/**/*.js']
} satisfies TypeOrmModuleOptions

export const AppDataSource = new DataSource(dataSourceoptions)
