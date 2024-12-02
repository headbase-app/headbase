import {GenericManagerScreenProps} from "../../../common/generic-manager/generic-manager.tsx";
import {useContentTypeQuery} from "../../../../../logic/react/tables/use-type-query.tsx";
import {AdminList, AdminListItemProps} from "../../../../layout/admin-list/admin-list.tsx";
import {LiveQueryStatus} from "../../../../../logic/control-flow.ts";


export function ListContentTypesScreen(props: GenericManagerScreenProps) {
	const contentTypes = useContentTypeQuery({filter: {isDeleted: false}})

	const listItems: AdminListItemProps[] = contentTypes.status === LiveQueryStatus.SUCCESS
		? contentTypes.result.map(contentType => ({
			id: contentType.id,
			title: contentType.name,
			description: `desc: ${contentType.description} | entity: ${contentType.id} | version: ${contentType.versionId} | created: ${contentType.createdAt} | updated: ${contentType.updatedAt}`,
			navigate: props.navigate
		}))
		: []

	return (
		<>
			<AdminList
				title="Content Types"
				description="Content types ."
				addNewText="New Content Type"
				noItemsText="No Content Types"
				loadingText="Loading Content Types..."
				isLoading={contentTypes.status === LiveQueryStatus.LOADING}
				items={listItems}
				navigate={props.navigate}
			/>
		</>
	)
}
