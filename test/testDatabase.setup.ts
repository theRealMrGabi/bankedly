import { newDb, DataType, IMemoryDb } from 'pg-mem'
import { DataSource } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

import { ormConfig } from '../src/config/ormconfig'

export const setupTestDataSource = async () => {
	const db: IMemoryDb = newDb({
		autoCreateForeignKeyIndices: true
	})

	db.public.registerFunction({
		name: 'current_database',
		args: [],
		returns: DataType.text,
		implementation: () => 'test_db'
	})

	db.public.registerFunction({
		name: 'version',
		args: [],
		returns: DataType.text,
		implementation: () => 'PostgreSQL 12.0'
	})

	db.public.registerFunction({
		name: 'obj_description',
		args: [DataType.text, DataType.text],
		returns: DataType.text,
		implementation: () => null
	})

	db.public.registerFunction({
		name: 'format_type',
		args: [DataType.integer, DataType.integer],
		returns: DataType.text,
		implementation: () => 'text'
	})

	db.public.registerFunction({
		name: 'col_description',
		args: [DataType.integer, DataType.integer],
		returns: DataType.text,
		implementation: () => null
	})

	db.registerExtension('uuid-ossp', (schema) => {
		schema.registerFunction({
			name: 'uuid_generate_v4',
			returns: DataType.uuid,
			implementation: uuidv4,
			impure: true
		})
	})

	try {
		const ds: DataSource = await db.adapters.createTypeormDataSource({
			type: 'postgres',
			entities: ormConfig().entities
		})
		await ds.initialize()
		await ds.synchronize()

		return ds
	} catch (error) {
		console.error('Error setting up data source:', error)
		throw error
	}
}
