import { setSeederFactory } from 'typeorm-extension'
import {
	randFirstName,
	randLastName,
	randEmail,
	randUserName
} from '@ngneat/falso'

import { User } from '../../users/entities/user.entity'
import { generateNigerianPhoneNumber } from '../../utils'

export default setSeederFactory(User, () => {
	const user = new User()

	user.firstname = randFirstName()
	user.lastname = randLastName()
	user.phoneNumber = generateNigerianPhoneNumber()
	user.email = randEmail()
	user.password = 'r@ndom!?P@ssword123!'
	user.username = randUserName({ withAccents: false }).replace(
		/[^a-zA-Z0-9]/g,
		''
	)

	return user
})
