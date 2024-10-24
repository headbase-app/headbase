import { GenericManagerScreenProps } from "../../../../common/generic-manager/generic-manager";
import { AdminList, AdminListItemProps } from "../../../../patterns/layout/admin-list/admin-list";
import React, { useState } from "react";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";
import { ErrorCallout } from "../../../../patterns/components/error-callout/error-callout";
import { useObservableQuery } from "@headbase-toolkit/react/use-observable-query";
import {HeadbaseTableSchemas, HeadbaseTableTypes} from "../../../../state/headbase-localful";
import {useLocalful} from "@headbase-toolkit/react/use-localful";

export function ListContentTypesScreen(props: GenericManagerScreenProps) {
	const {currentDatabase} = useLocalful<HeadbaseTableTypes, HeadbaseTableSchemas>()
	const [errors, setErrors] = useState<unknown[]>([])

	const contentTypes = useObservableQuery(currentDatabase?.liveQuery({table: 'content_types'}))

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
			{errors.length > 0 && <ErrorCallout errors={errors} />}
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