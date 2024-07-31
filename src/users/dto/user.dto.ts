import { Expose } from 'class-transformer'

export class UserDto {
	@Expose()
	id: number

	@Expose()
	username: string

	@Expose()
	firstname: string

	@Expose()
	lastname: string

	@Expose()
	email: string

	@Expose()
	phoneNumber: string

	@Expose()
	isEmailVerified: boolean

	@Expose()
	emailVerifiedAt: Date

	@Expose()
	accountStatus: string

	@Expose()
	role: string

	@Expose()
	createdAt: Date

	@Expose()
	updatedAt: Date
}
