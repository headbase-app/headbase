export type FieldData = string | number | boolean | null
export type ObjectFields = {
	[key: string]: FieldData | FieldData[] | ObjectFields
}

export type WhereQuery = {
	[field: string]: {
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

export interface Query {
	page?: {
		limit?: number
		offset?: number
	}
	order?: {
		[field: string]: 'desc' | 'asc'
	}
	where?: WhereQuery
}
