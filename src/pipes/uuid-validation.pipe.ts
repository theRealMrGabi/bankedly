import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { validate as uuidValidate } from 'uuid'

@Injectable()
export class UUIDValidationPipe implements PipeTransform<string> {
	transform(value: string): string {
		if (!uuidValidate(value)) {
			throw new BadRequestException(`Invalid id: ${value}`)
		}
		return value
	}
}
