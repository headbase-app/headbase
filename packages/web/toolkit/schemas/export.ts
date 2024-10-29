import {TableKeys, TableTypes} from "./schema";

export interface ExportEntity<
	TableKey extends TableKeys
> {
	id: string
	createdAt: string
	updatedAt: string
	headbaseVersion: string
	schemaVersion: string
	data: TableTypes[TableKey]
}

export type ExportData = {
	exportVersion: "v1";
	data: {
		[TableKey in TableKeys]?: ExportEntity<TableKey>[];
	}
};
