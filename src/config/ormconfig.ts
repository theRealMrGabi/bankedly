import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { DataSource, DataSourceOptions } from 'typeorm'

export const ormConfig = (
	configService: ConfigService
): TypeOrmModuleOptions => ({
	type: 'postgres',
	host: configService.get('DB_HOST'),
	port: +configService.get('DB_PORT'),
	username: configService.get('DB_USERNAME'),
	password: configService.get('DB_PASSWORD'),
	database: configService.get('DB_NAME'),
	synchronize: false,
	logging: true,
	entities:
		process.env.NODE_ENV === 'test' ? ['**/*.entity.ts'] : ['**/*.entity.js'],
	migrations: ['src/migration/**/*.js']
})

const configService = new ConfigService()

export const dataSourceoptions: DataSourceOptions = {
	type: 'postgres',
	host: configService.get('DB_HOST'),
	port: +configService.get('DB_PORT'),
	username: configService.get('DB_USERNAME'),
	password: configService.get('DB_PASSWORD'),
	database: configService.get('DB_NAME'),
	synchronize: false,
	logging: true,
	entities:
		process.env.NODE_ENV === 'test' ? ['**/*.entity.ts'] : ['**/*.entity.js'],
	migrations: ['src/migration/**/*.js']
} satisfies TypeOrmModuleOptions

export const AppDataSource = new DataSource(dataSourceoptions)
