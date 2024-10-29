import {EntityDto, EntityVersion} from "./common/entities";
import {IDBPIndex} from "idb";
import {
	TableKeys,
	LocalEntityWithExposedFields, ExposedFields, TableTypes,
} from "./schema";

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
	TableKey extends TableKeys
> = {
	field: ExposedFields<TableKey>
} & IndexFilters

export type WhereCursor<
	TableKey extends TableKeys
> = (
	entity: LocalEntityWithExposedFields<TableKey>,
	version: EntityVersion,
) => boolean

export type WhereData<
	TableKey extends TableKeys
> = (entityDto: EntityDto<TableTypes[TableKey]>) => boolean

export interface QueryDefinition<
	TableKey extends TableKeys
> {
	table: TableKey
	index?: IndexWhereOption<TableKey>
	whereCursor?: WhereCursor<TableKey>
	whereData?: WhereData<TableKey>
	sort?: (entityDto: EntityDto<TableTypes[TableKey]>[]) => EntityDto<TableTypes[TableKey]>[],
}

export interface QueryIndex {
	index: IDBPIndex
	query?: IDBKeyRange | IDBValidKey | null,
	direction?: IDBCursorDirection
}
