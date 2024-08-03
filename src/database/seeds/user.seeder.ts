import { Seeder, SeederFactoryManager } from 'typeorm-extension'
import { DataSource } from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { UserRoles } from '../../users/users.interface'
import { EnvKeys } from '../../utils'
import { ConfigServiceSetup } from '../../config/config.service'

export default class UserSeeder implements Seeder {
	public async run(
		dataSource: DataSource,
		factoryManager: SeederFactoryManager
	): Promise<void> {
		const configService = ConfigServiceSetup.getInstance()
		const repository = dataSource.getRepository(User)

		try {
			const adminEmail = configService.get(EnvKeys.ADMIN_SEEDED_EMAIL) as string

			const adminExists = await repository.findOneBy({
				email: adminEmail.toLowerCase()
			})

			if (!adminExists) {
				const adminUser = new User()
				adminUser.username = configService.get(EnvKeys.ADMIN_SEEDED_USERNAME)
				adminUser.firstname = 'Super'
				adminUser.lastname = 'Admin'
				adminUser.phoneNumber = configService.get(
					EnvKeys.ADMIN_SEEDED_PHONE_NUMBER
				)
				adminUser.role = UserRoles.ADMIN
				adminUser.email = configService.get(EnvKeys.ADMIN_SEEDED_EMAIL)
				adminUser.password = configService.get(EnvKeys.ADMIN_SEEDED_PASSWORD)
				adminUser.emailVerifiedAt = new Date()
				adminUser.isEmailVerified = true

				// This will trigger the @BeforeInsert hook and other hooks
				await repository.save(adminUser)
			}

			const userFactory = factoryManager.get(User)
			await userFactory.saveMany(5)

			//Typically used for saving the adminUser details. This wont trigger the @BeforeInsert hook
			// await userFactory.save()
			console.log('seeder successful')
		} catch (error) {
			console.error('🚀 ==> error running seeder:', error)
		}
	}
}
