import { setSeederFactory } from 'typeorm-extension'
import { User } from '../../users/entities/user.entity'
import {
	randFirstName,
	randLastName,
	randPhoneNumber,
	randEmail,
	randUserName
} from '@ngneat/falso'

export default setSeederFactory(User, () => {
	const user = new User()

	user.firstname = randFirstName()
	user.lastname = randLastName()
	user.phoneNumber = randPhoneNumber({ countryCode: 'NG' })
	user.email = randEmail()
	user.password = 'r@ndom!?P@ssword123!'
	user.username = randUserName()

	return user
})
