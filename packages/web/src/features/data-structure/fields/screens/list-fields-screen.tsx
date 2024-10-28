import { GenericManagerScreenProps } from "../../../../common/generic-manager/generic-manager";
import { AdminList, AdminListItemProps } from "../../../../patterns/layout/admin-list/admin-list";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {useContentQuery} from "@headbase-toolkit/react/use-content-query";
import {TableSchema, TableTypes} from "@headbase-toolkit/schemas/schema";
import {FIELD_TYPES} from "@headbase-toolkit/schemas/entities/fields/field-types";


export function ListFieldsScreen(props: GenericManagerScreenProps) {

	const { currentDatabaseId } = useHeadbase<TableTypes, TableSchema>()

	const fields = useContentQuery(currentDatabaseId, {table: 'fields'})

	const listItems: AdminListItemProps[] = fields.status === LiveQueryStatus.SUCCESS
		? fields.result.map(field => ({
			id: field.id,
			title: field.data.label,
			description: `type: ${FIELD_TYPES[field.data.type].label} | entity: ${field.id} | version: ${field.versionId} | created: ${field.createdAt} | updated: ${field.updatedAt}`,
			navigate: props.navigate
		}))
		: []

	return (
		<>
			<AdminList
				title="Fields"
				description="Fields are the most important part of content structure as they define what data you actually want to store. Fields are added to content types, and then when creating content you fill in the fields defined on that content type."
				addNewText="New Field"
				noItemsText="No Fields Found"
				loadingText="Loading Fields..."
				isLoading={fields.status === LiveQueryStatus.LOADING}
				items={listItems}
				navigate={props.navigate}
			/>
		</>
	)
}