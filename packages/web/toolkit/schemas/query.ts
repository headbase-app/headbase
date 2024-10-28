import {EntityDto, EntityVersion} from "./entities";
import {IDBPIndex} from "idb";
import {
	TableKeys,
	TableSchemaDefinitions, TableTypeExposedFields, TableTypeDefinitions,
	LocalEntityWithExposedFields,
} from "./tables";

export type EqualFilter = {
	operation: 'equal',
	value: string | number
}

export type RangeFilter = {
	operation: 'range',
	greaterThan?: string | number,
	greaterThanEqualTo?: string | number,
	lessThan?: string | number,
	lessThanEqualTo?: string | number,
}

export type IncludesFilter = {
	operation: 'includes',
	value: (string | number)[]
}

export type IndexFilters = EqualFilter | RangeFilter | IncludesFilter

export type IndexWhereOption<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>,
	TableKey extends TableKeys<TableTypes>
> = {
	field: TableTypeExposedFields<TableTypes, TableSchemas, TableKey>
} & IndexFilters

export type WhereCursor<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>,
	TableKey extends TableKeys<TableTypes>
> = (
	entity: LocalEntityWithExposedFields<TableTypes, TableSchemas, TableKey>,
	version: EntityVersion,
) => boolean

export type WhereData<
	TableTypes extends TableTypeDefinitions,
	TableKey extends TableKeys<TableTypes>
> = (entityDto: EntityDto<TableTypes[TableKey]>) => boolean

export interface QueryDefinition<
	TableTypes extends TableTypeDefinitions,
	TableSchemas extends TableSchemaDefinitions<TableTypes>,
	TableKey extends TableKeys<TableTypes>
> {
	table: TableKey
	index?: IndexWhereOption<TableTypes, TableSchemas, TableKey>
	whereCursor?: WhereCursor<TableTypes, TableSchemas, TableKey>
	whereData?: WhereData<TableTypes, TableKey>
	sort?: (entityDto: EntityDto<TableTypes[TableKey]>[]) => EntityDto<TableTypes[TableKey]>[],
}

export interface QueryIndex {
	index: IDBPIndex
	query?: IDBKeyRange | IDBValidKey | null,
	direction?: IDBCursorDirection
}
