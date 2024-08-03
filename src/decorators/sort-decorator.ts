import {
	ExecutionContext,
	NotAcceptableException,
	createParamDecorator
} from '@nestjs/common'
import { Request } from 'express'

export type SortingParam<T> = {
	sort: keyof T
}

export const SortingParams = createParamDecorator(
	<T>(
		validParams: (keyof T)[],
		ctx: ExecutionContext
	): SortingParam<T> | null => {
		const req: Request = ctx.switchToHttp().getRequest()
		const sort = req.query.sort as string

		if (!sort) return null

		// Check if validParams is an array
		if (!Array.isArray(validParams)) {
			throw new NotAcceptableException('Invalid sort parameter configuration')
		}

		// Check the format of the sort query param
		const sortPattern = /^[a-zA-Z0-9]+$/
		if (!sort.match(sortPattern)) {
			throw new NotAcceptableException('Invalid sort parameter format')
		}

		// Extract the property name and check if it is valid
		const sortKey = sort as keyof T

		// Convert both `sortKey` and `validParams` to strings for comparison
		const validKeys = validParams.map((key) => String(key))

		if (!validKeys.includes(String(sortKey))) {
			throw new NotAcceptableException(
				`Invalid sort property: ${String(sortKey)}, allowed: [${validKeys.join(', ')}]`
			)
		}

		return { sort: sortKey }
	}
)
