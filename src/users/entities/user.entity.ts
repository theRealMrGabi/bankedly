import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	BeforeInsert,
	BeforeUpdate,
	AfterLoad,
	OneToMany
} from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { Exclude } from 'class-transformer'

import { UserRoles, AccountStatus } from '../users.interface'
import { Account } from '../../account/entities/account.entity'

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

	@OneToMany(() => Account, (bankAccount) => bankAccount.user)
	bankAccounts: Array<Account>

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

	@Exclude()
	private previousPassword: string // Define the transient property

	@AfterLoad()
	private loadPassword(): void {
		this.previousPassword = this.password
	}

	@BeforeInsert()
	@BeforeUpdate()
	lowercaseEmail() {
		if (this.email) {
			this.email = this.email.toLowerCase()
		}
	}

	@BeforeInsert()
	@BeforeUpdate()
	async hashPassword() {
		if (this.password && this.password !== this.previousPassword) {
			const salt = await bcrypt.genSalt(12)
			this.password = await bcrypt.hash(this.password, salt)
		}
	}
}
