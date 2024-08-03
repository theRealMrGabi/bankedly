import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class UserPhoneNumber1719875323941 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'user',
			new TableColumn({
				name: 'phoneNumber',
				type: 'varchar',
				isNullable: false
			})
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('user', 'phoneNumber')
	}
}
