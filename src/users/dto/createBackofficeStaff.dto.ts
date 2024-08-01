import {
	IsNotEmpty,
	ValidationOptions,
	registerDecorator,
	ValidationArguments
} from 'class-validator'
import { SignupDto } from '../../auth/dto/signup.dto'
import { UserRoles } from '../users.interface'

export class CreateBackOfficeStaffDto extends SignupDto {
	@IsNotEmpty()
	@IsAdminOrEditor({
		message: `Role must be either 'admin' or 'editor'`
	})
	role: UserRoles
}

export function IsAdminOrEditor(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'isAdminOrEditor',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				validate(value: any, _args: ValidationArguments) {
					return value === UserRoles.ADMIN || value === UserRoles.EDITOR
				},
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				defaultMessage(_args: ValidationArguments) {
					return `Role must be either 'admin' or 'editor'`
				}
			}
		})
	}
}
