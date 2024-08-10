import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn
} from 'typeorm'

import { AccountStatus, AccountType } from '../account.interface'
import { User } from '../../users/entities/user.entity'

@Entity()
export class Account {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({ unique: true })
	accountNumber: string

	@ManyToOne(() => User, (user) => user.bankAccounts, {
		nullable: false,
		eager: true
	})
	@JoinColumn({ name: 'userId' })
	user: User

	@Column('decimal', { default: 0.0, precision: 10, scale: 2 })
	balance: number

	@Column({
		type: 'enum',
		enum: AccountType
	})
	type: string

	@Column({
		type: 'enum',
		enum: AccountStatus,
		default: AccountStatus.ACTIVE
	})
	status: string

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date
}
