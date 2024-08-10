import { IsEnum, IsInt, IsOptional, Max, Min, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import 'reflect-metadata'

import { SortOrder } from '../../interface/utils.interface'

export class PaginationQueryDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 20

	@IsOptional()
	@IsEnum(['ASC', 'DESC'])
	order?: SortOrder = 'DESC'

	@IsOptional()
	@IsString()
	keyword?: string
}
