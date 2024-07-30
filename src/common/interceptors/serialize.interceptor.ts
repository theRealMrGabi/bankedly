import {
	UseInterceptors,
	NestInterceptor,
	ExecutionContext,
	CallHandler
} from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

interface ClassConstructor {
	new (...args: unknown[]): unknown
}

export function Serialize(dto: ClassConstructor) {
	return UseInterceptors(new SerializeInterceptor(dto))
}

export class SerializeInterceptor implements NestInterceptor {
	constructor(private dto: any) {}

	intercept(
		context: ExecutionContext,
		handler: CallHandler<any>
	): Observable<unknown> | Promise<Observable<unknown>> {
		return handler.handle().pipe(
			map((data: unknown) => {
				return plainToInstance(this.dto, data, {
					excludeExtraneousValues: true
				})
			})
		)
	}
}
