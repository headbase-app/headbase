import {TableTypeDefinitions, TableKeys} from "./tables";

export interface ExportEntity<
	TableTypes extends TableTypeDefinitions,
	TableKey extends TableKeys<TableTypes>
> {
	id: string
	createdAt: string
	updatedAt: string
	headbaseVersion: string
	schemaVersion: string
	data: TableTypes[TableKey]
}

export type ExportData<TableTypes extends TableTypeDefinitions> = {
	exportVersion: "v1";
	data: {
		[TableKey in TableKeys<TableTypes>]?: ExportEntity<TableTypes, TableKey>[];
	}
};
