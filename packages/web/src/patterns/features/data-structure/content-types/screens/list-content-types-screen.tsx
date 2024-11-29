import { GenericManagerScreenProps } from "../../../../common/generic-manager/generic-manager";
import { AdminList, AdminListItemProps } from "../../../../patterns/layout/admin-list/admin-list";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {useContentQuery} from "@headbase-toolkit/react/use-content-query";


export function ListContentTypesScreen(props: GenericManagerScreenProps) {
	const {currentDatabaseId} = useHeadbase()
	const contentTypes = useContentQuery(currentDatabaseId, {table: 'content_types'})

	const listItems: AdminListItemProps[] = contentTypes.status === LiveQueryStatus.SUCCESS
		? contentTypes.result.map(contentType => ({
			id: contentType.id,
			title: contentType.data.name,
			description: `desc: ${contentType.data.description} | entity: ${contentType.id} | version: ${contentType.versionId} | created: ${contentType.createdAt} | updated: ${contentType.updatedAt}`,
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