import React, { useState } from "react";
import {ContentTypeForm} from "../forms/content-type-form";
import {ErrorTypes} from "../../../../../logic/control-flow.ts";
import {GenericManagerScreenProps} from "../../../common/generic-manager/generic-manager.tsx";
import {useHeadbase} from "../../../../../logic/react/use-headbase.tsx";
import {ContentTypeData} from "../../../../../logic/schemas/content-types/dtos.ts";
import {ErrorCallout} from "../../../../components/error-callout/error-callout.tsx";

export function CreateContentTypeScreen(props: GenericManagerScreenProps) {
	const {headbase, currentDatabaseId} = useHeadbase()
	const [errors, setErrors] = useState<unknown[]>([])

	async function onSave(data: ContentTypeData) {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.db.createType({
				...data,
				createdBy: 'todo'
			})
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
				data={{
					name: '',
					icon: null,
					colour: null,
					description: null,
					templateName: '',
					templateFields: {}
				}}
				onSave={onSave}
				navigate={props.navigate}
			/>
		</>
	);
}
