export interface PaginationAndFilter<T> {
	filters?: Partial<Omit<T, 'page' | 'limit' | 'sort' | 'order'>>
	page?: number
	limit?: number
	sort?: keyof T
	order?: SortOrder
	keyword?: string
}

export type SortOrder = 'ASC' | 'DESC'
