import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn
} from 'typeorm'
import { EmailStatus, UserRoles, AccountStatus } from '../users.interface'

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({ unique: true })
	username: string

	@Column()
	password: string

	@Column()
	firstname: string

	@Column()
	lastname: string

	@Column({ unique: true })
	email: string

	@Column({
		type: 'enum',
		enum: EmailStatus,
		default: EmailStatus.NOT_VERIFIED
	})
	isEmailVerified: string

	@CreateDateColumn()
	emailVerifiedAt: Date

	@Column({
		type: 'enum',
		enum: AccountStatus,
		default: AccountStatus.ACTIVE
	})
	accountStatus: string

	@Column({
		type: 'enum',
		enum: UserRoles,
		default: UserRoles.CUSTOMER
	})
	role: string

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
