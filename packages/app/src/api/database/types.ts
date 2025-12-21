export type FieldData = string | number | boolean | null
export type ObjectFields = {
	[key: string]: FieldData | FieldData[] | ObjectFields
}

export type ObjectBlobData = ArrayBuffer

export interface ObjectDto {
	spec: string,
	type: string,
	id: string,
	versionId:string,
	previousVersionId: string | null,
	createdAt: string,
	createdBy: string,
	updatedAt: string,
	updatedBy: string,
	fields: ObjectFields,
	blob?: ObjectBlobData | null
}

export interface CreateObjectDto extends Pick<ObjectDto, 'type'|'createdBy'|'fields'|'blob'> {
	id?: string
}
export interface UpdateObjectDto extends Pick<ObjectDto, 'updatedBy'>, Partial<Pick<ObjectDto, 'type'|'fields'|'blob'>> {}

export interface ObjectVersionDto {
	spec: string,
	type: string,
	objectId: string,
	id: string,
	previousVersionId: string | null,
	createdAt: string,
	createdBy: string,
	deletedAt: string | null,
	deletedBy: string | null,
	fields: ObjectFields
	blob?: ObjectBlobData | null
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
