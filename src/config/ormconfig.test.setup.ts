import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

const ormTestConfig: TypeOrmModuleOptions & PostgresConnectionOptions = {
	type: 'postgres',
	host: process.env.DB_HOST,
	port: +process.env.DB_PORT,
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	entities: ['**/*.entity.{ts,js}'],
	synchronize: false,
	migrationsRun: false,
	logging: false,
	migrations: ['src/migration/**/*.js'],
	migrationsTransactionMode: 'each'
}

export const datasource = new DataSource(ormTestConfig)
export { ormTestConfig }
