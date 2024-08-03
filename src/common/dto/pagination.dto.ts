import { IsEnum, IsInt, IsOptional, Max, Min, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import 'reflect-metadata'

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
	order?: 'ASC' | 'DESC' = 'DESC'

	@IsOptional()
	@IsString()
	keyword?: string
}
