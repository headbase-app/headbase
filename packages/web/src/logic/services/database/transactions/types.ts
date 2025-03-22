
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
