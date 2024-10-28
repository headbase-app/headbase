import React, { useState } from "react";
import { ErrorCallout } from "../../../../patterns/components/error-callout/error-callout";
import {ErrorTypes} from "@headbase-toolkit/control-flow";
import {
	GenericManagerScreenProps
} from "../../../../common/generic-manager/generic-manager";
import {ContentTypeForm} from "../forms/content-type-form";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {TableSchema, TableTypes} from "@headbase-toolkit/schemas/schema";
import {ContentTypeData} from "@headbase-toolkit/schemas/entities/content-types";

export function CreateContentTypeScreen(props: GenericManagerScreenProps) {
	const {headbase, currentDatabaseId} = useHeadbase<TableTypes, TableSchema>()
	const [errors, setErrors] = useState<unknown[]>([])

	async function onSave(data: ContentTypeData) {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.tx.create(currentDatabaseId, 'content_types', data)
			props.navigate({screen: "list"})
		}
		catch (e) {
			console.error(e)
			setErrors([e])
		}
	}

	return (
		<>
			{errors.length > 0 && <ErrorCallout errors={errors} />}
			<ContentTypeForm
				title="Create Content Type"
				data={{ name: "", fields: [] }}
				onSave={onSave}
				navigate={props.navigate}
			/>
		</>
	);
}
