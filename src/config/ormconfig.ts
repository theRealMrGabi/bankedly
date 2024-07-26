import { DataSource } from 'typeorm'
import { SeederOptions } from 'typeorm-extension'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

import { EnvKeys } from '../utils'
import { ConfigServiceSetup } from './config.service'

const configService = ConfigServiceSetup.getInstance()
const isTestEnvironment = process.env.NODE_ENV === 'test'
const isDevEnvironment = process.env.NODE_ENV === 'development'

export const ormConfig = (): PostgresConnectionOptions & SeederOptions => ({
	type: 'postgres',
	host: configService.get(EnvKeys.DB_HOST),
	port: +configService.get(EnvKeys.DB_PORT),
	username: configService.get(EnvKeys.DB_USERNAME),
	password: configService.get(EnvKeys.DB_PASSWORD),
	database: configService.get(EnvKeys.DB_NAME),
	synchronize: false,
	logging: isDevEnvironment,
	entities: isTestEnvironment ? ['**/*.entity.ts'] : ['**/*.entity.js'],
	migrations: ['src/migration/**/*.js'],
	seeds: ['dist/src/database/seeds/**/*.js'],
	factories: ['dist/src/database/factories/**/*.js'],
	seedTracking: false
})

export const dataSourceOptions: PostgresConnectionOptions & SeederOptions = {
	...ormConfig()
}

export const AppDataSource = new DataSource(dataSourceOptions)
