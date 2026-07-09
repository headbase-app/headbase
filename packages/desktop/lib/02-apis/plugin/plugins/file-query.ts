export type FieldData = string | number | boolean | null
export type ObjectFields = {
	[key: string]: FieldData | FieldData[] | ObjectFields
}

export type FieldKey = "$file.name" | "$file.path" | "$file.text" | string

export type WhereQuery = {
	[field: FieldKey]: {
		$equal?: string | number | boolean
		$notEqual?: string | number | boolean
		$in?: string[] | number[]
		$notIn?: string[] | number[]
		$like?: string
		$iLike?: string
		$notLike?: string
		$notILike?: string
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

// todo: add ability to page
export interface BaseQuery {
	order?: {
		[field: FieldKey]: 'desc' | 'asc'
	}
	where?: WhereQuery
}
