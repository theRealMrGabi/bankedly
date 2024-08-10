import {
	MigrationInterface,
	QueryRunner,
	Table,
	TableForeignKey
} from 'typeorm'

export class CreateAccountTable1722731202217 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."account_type_enum" AS ENUM('current_account', 'savings_account', 'corporate_account')`
		)
		await queryRunner.query(
			`CREATE TYPE "public"."account_status_enum" AS ENUM('active', 'dormant', 'frozen', 'under_review')`
		)

		// Create Account table
		await queryRunner.createTable(
			new Table({
				name: 'account',
				columns: [
					{
						name: 'id',
						type: 'uuid',
						isPrimary: true,
						isGenerated: true,
						generationStrategy: 'uuid',
						default: 'uuid_generate_v4()'
					},
					{
						name: 'accountNumber',
						type: 'varchar',
						isUnique: true
					},
					{
						name: 'userId',
						type: 'uuid'
					},
					{
						name: 'balance',
						type: 'decimal',
						default: 0.0,
						precision: 10,
						scale: 2
					},
					{
						name: 'type',
						type: 'account_type_enum',
						isNullable: false
					},
					{
						name: 'status',
						type: 'account_status_enum',
						default: "'active'"
					},
					{
						name: 'createdAt',
						type: 'timestamp',
						default: 'CURRENT_TIMESTAMP'
					},
					{
						name: 'updatedAt',
						type: 'timestamp',
						default: 'CURRENT_TIMESTAMP',
						onUpdate: 'CURRENT_TIMESTAMP'
					}
				]
			})
		)

		// Create foreign key constraint
		await queryRunner.createForeignKey(
			'account',
			new TableForeignKey({
				columnNames: ['userId'],
				referencedTableName: 'user',
				referencedColumnNames: ['id'],
				onDelete: 'CASCADE'
			})
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Drop foreign key constraint
		const table = await queryRunner.getTable('account')
		const foreignKey = table.foreignKeys.find(
			(fk) => fk.columnNames.indexOf('userId') !== -1
		)
		await queryRunner.dropForeignKey('account', foreignKey)

		// Drop Account table
		await queryRunner.dropTable('account')
	}
}
