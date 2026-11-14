export type DataValue = string | number | boolean | null;
export interface Data {
    [key: string]: DataValue | DataValue[] | Data
}

export interface MatterDocument {
    id: string
    vid: string
    type: string
    data?: Data | null
    blob?: Uint8Array | null
    createdAt: string
    updatedAt: string
    deleted?: boolean | null
}

export type CreateDocumentDto =
    Pick<MatterDocument, 'id' | 'vid' | 'type' | 'data' | 'blob'> &
    Partial<Pick<MatterDocument, 'id' | 'vid'>>;
export type UpdateDocumentDto = Partial<Pick<MatterDocument, 'vid' | 'type' | 'data' | 'blob' | 'deleted'>>

// Updates to the document (update or delete) return a version id.
// They can't return the full document as this wouldn't include changes like updatedAt which are done via triggers.
export interface VersionData {
    vid: string
}

export enum MatterDatabaseErrors {
    M_DENIED_VERSIONS_IMMUTABLE = "M_DENIED_VERSIONS_IMMUTABLE",
    M_DENIED_LATEST_VERSION_DELETE = "M_DENIED_LATEST_VERSION_DELETE",
    M_DENIED_PURGE_BEFORE_DELETE = "M_DENIED_PURGE_BEFORE_DELETE",
    M_NOT_FOUND = "M_NOT_FOUND",
    M_SYSTEM_ERROR = "M_SYSTEM_ERROR"
}
