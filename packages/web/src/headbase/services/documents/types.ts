
export interface LocalDocument {
	spec: string,
	type: string,
	id: string,
	versionId: string,
	previousVersionId: string | null,
	createdAt: string,
	createdBy: string,
	updatedAt: string,
	updatedBy: string,
	deletedAt: string | null,
	data: any
}

export interface LocalDocumentVersion {
	spec: string,
	type: string,
	documentId: string,
	id: string,
	previousVersionId: string | null,
	createdAt: string,
	createdBy: string,
	deletedAt: string | null,
	data: any
}

export type CreateLocalDocument = Pick<LocalDocument, 'type' | 'createdBy' | 'data'> & {
	id?: string
}

export type UpdateLocalDocument = Pick<LocalDocument, 'type' | 'updatedBy' | 'data'>

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
