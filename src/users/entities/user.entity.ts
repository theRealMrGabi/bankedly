import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	BeforeInsert,
	BeforeUpdate
} from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { Exclude } from 'class-transformer'

import { UserRoles, AccountStatus } from '../users.interface'

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column({ unique: true })
	username: string

	@Column()
	@Exclude()
	password: string

	@Column()
	firstname: string

	@Column()
	lastname: string

	@Column({ unique: true })
	email: string

	@Column({ unique: true })
	phoneNumber: string

	@Column({
		type: 'boolean',
		default: false
	})
	isEmailVerified: boolean

	@Column({ type: 'timestamp', nullable: true, default: null })
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

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date

	@BeforeInsert()
	@BeforeUpdate()
	lowercaseEmail() {
		if (this.email) {
			this.email = this.email.toLowerCase()
		}
	}

	@BeforeInsert()
	async hashPassword() {
		const salt = await bcrypt.genSalt(12)
		this.password = await bcrypt.hash(this.password, salt)
	}
}
