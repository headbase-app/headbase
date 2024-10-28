import {TableKeys} from "./schema";
import {TableSchema} from "@headbase-toolkit/schemas/schema";

export interface ExportEntity<
	TableKey extends TableKeys
> {
	id: string
	createdAt: string
	updatedAt: string
	headbaseVersion: string
	schemaVersion: string
	data: TableSchema['tables'][TableKey]
}

export type ExportData = {
	exportVersion: "v1";
	data: {
		[TableKey in TableKeys]?: ExportEntity<TableKey>[];
	}
};
