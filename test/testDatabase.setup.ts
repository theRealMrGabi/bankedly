import { ormTestConfig } from '../src/config/ormconfig.test.setup'
import { newDb, DataType } from 'pg-mem'
import { DataSource } from 'typeorm'

function v4(): string {
	const randomValue = (Math.random() * 16) | 0
	const variantBit = (c) =>
		c === 'x' ? randomValue : (randomValue & 0x3) | 0x8

	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const v = variantBit(c)
		return v.toString(16)
	})
}

export const setupTestDataSource = async () => {
	const db = newDb({
		autoCreateForeignKeyIndices: true
	})

	db.public.registerFunction({
		implementation: () => 'test',
		name: 'current_database',
		returns: DataType.text
	})

	db.registerExtension('uuid-ossp', (schema) => {
		schema.registerFunction({
			name: 'uuid_generate_v4',
			returns: DataType.uuid,
			implementation: v4,
			impure: true
		})
	})

	db.public.registerFunction({
		name: 'version',
		implementation: () =>
			'PostgreSQL 14.2, compiled by Visual C++ build 1914, 64-bit'
	})

	db.public.registerFunction({
		name: 'obj_description',
		args: [DataType.regclass, DataType.text],
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		implementation: (obj: any, desc: string) => null,
		returns: DataType.text
	})

	try {
		const ds: DataSource =
			await db.adapters.createTypeormDataSource(ormTestConfig)
		await ds.initialize()
		await ds.synchronize()

		return ds
	} catch (error) {
		console.error('Error setting up data source:', error)
		throw error
	}
}
