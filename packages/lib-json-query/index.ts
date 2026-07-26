export type Data = string | number | boolean | null | undefined
export type DataFields = {
	[key: string]: Data | Data[] | DataFields
}
export type FieldKey = "$file.name" | "$file.path" | "$file.text" | string
export type WhereQuery = {
	[field: FieldKey]: {
		$equal?: string | number | boolean
		$notEqual?: string | number | boolean
		$incudes?: string | number
		$notIncludes?: string | number
		$in?: string[] | number[]
		$notIn?: string[] | number[]
		$less?: string | number
		$lessEqual?: string | number
		$greater?: string | number
		$greaterEqual?: string | number
		$and?: WhereQuery[]
		$or?: WhereQuery[]
	}
} & {
	$and?: WhereQuery[]
	$or?: WhereQuery[]
}

// todo: add ability to page results?
export interface DataQuery {
	order?: {
		[field: FieldKey]: 'desc' | 'asc'
	}
	where?: WhereQuery
}
