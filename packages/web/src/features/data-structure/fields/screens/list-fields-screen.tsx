import { GenericManagerScreenProps } from "../../../../common/generic-manager/generic-manager";
import { AdminList, AdminListItemProps } from "../../../../patterns/layout/admin-list/admin-list";
import React, { useState } from "react";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";
import { ErrorCallout } from "../../../../patterns/components/error-callout/error-callout";
import { FIELD_TYPES } from "../../../../state/schemas/fields/field-types";
import { useObservableQuery } from "@headbase-toolkit/react/use-observable-query";
import {HeadbaseTableSchemas, HeadbaseTableTypes} from "../../../../state/headbase";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";

export function ListFieldsScreen(props: GenericManagerScreenProps) {
	const [errors, setErrors] = useState<unknown[]>([])

	const { currentDatabase } = useHeadbase<HeadbaseTableTypes, HeadbaseTableSchemas>()

	const fields = useObservableQuery(currentDatabase?.liveQuery({table: 'fields'}))

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
			{errors.length > 0 && <ErrorCallout errors={errors} />}
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