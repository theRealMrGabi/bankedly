import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn
} from 'typeorm'

import { User } from '../../users/entities/user.entity'
import { Account } from '../../account/entities/account.entity'
import {
	TransactionStatus,
	TransactionType,
	TransactionDetail
} from '../transactions.interface'

@Entity()
export class Transaction {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@ManyToOne(() => User)
	@JoinColumn({ name: 'userId' })
	userId: string

	@ManyToOne(() => Account)
	@JoinColumn({ name: 'accountId' })
	accountId: string

	@Column('json')
	detail: TransactionDetail

	@Column()
	reference: string

	@Column('decimal', { default: 0.0, precision: 10, scale: 2 })
	amount: number

	@Column({
		type: 'enum',
		enum: TransactionType
	})
	type: TransactionType

	@Column({
		type: 'enum',
		enum: TransactionStatus
	})
	status: TransactionStatus

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date

	// @BeforeInsert()
	// @BeforeUpdate()
	// handleDetailSerialization() {
	// 	if (this.detail && typeof this.detail === 'object') {
	// 		this.detail = JSON.stringify(this.detail)
	// 	}
	// }

	// @AfterInsert()
	// @AfterLoad()
	// handleDetailDeserialization() {
	// 	if (this.detail && typeof this.detail === 'string') {
	// 		this.detail = JSON.parse(this.detail)
	// 	}
	// }
}
