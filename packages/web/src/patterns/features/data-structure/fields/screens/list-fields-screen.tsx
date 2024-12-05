import {GenericManagerScreenProps} from "../../../common/generic-manager/generic-manager.tsx";
import {useFieldQuery} from "../../../../../logic/react/tables/use-field-query.tsx";
import {AdminList, AdminListItemProps} from "../../../../layout/admin-list/admin-list.tsx";
import {LiveQueryStatus} from "../../../../../logic/control-flow.ts";
import {FIELDS} from "../../../../../logic/schemas/fields/types.ts";


export function ListFieldsScreen(props: GenericManagerScreenProps) {

	const fields = useFieldQuery({filter: {isDeleted: false}})

	const listItems: AdminListItemProps[] = fields.status === LiveQueryStatus.SUCCESS
		? fields.result.map(field => ({
			id: field.id,
			title: field.name,
			description: `type: ${FIELDS[field.type].label} | entity: ${field.id} | version: ${field.versionId} | created: ${field.createdAt} | updated: ${field.updatedAt}`,
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