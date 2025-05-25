
export interface DataObject {
	spec: string,
	type: string,
	id: string,
	versionId:string,
	previousVersionId: string | null,
	createdAt: string,
	createdBy: string,
	updatedAt: string,
	updatedBy: string,
	data: any
}

export interface DataObjectVersion {
	spec: string,
	type: string,
	objectId: string,
	id:string,
	previousVersionId: string | null,
	createdAt: string,
	createdBy: string,
	data: any
}

export type CreateDataObjectDto = Pick<DataObject, 'type' | 'createdBy' | 'data'> & {
	id?: string
}

export type UpdateDataObjectDto = Pick<DataObject, 'type' | 'updatedBy' | 'data'>


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
