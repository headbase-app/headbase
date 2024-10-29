import React, { useState } from "react";
import { ErrorCallout } from "../../../../patterns/components/error-callout/error-callout";
import {ErrorTypes, LiveQueryStatus} from "@headbase-toolkit/control-flow";
import {
	GenericManagerContentScreenProps,
} from "../../../../common/generic-manager/generic-manager";
import {ContentTypeForm} from "../forms/content-type-form";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {useContent} from "@headbase-toolkit/react/use-content";
import {ContentTypeData} from "@headbase-toolkit/schemas/entities/content-types";


export function EditContentTypeScreen(props: GenericManagerContentScreenProps) {
	const {currentDatabaseId, headbase} = useHeadbase()
	const [errors, setErrors] = useState<unknown[]>([])

	const contentTypeQuery = useContent(currentDatabaseId, 'content_types', props.id)

	async function onSave(updatedData: Partial<ContentTypeData>) {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.tx.update(currentDatabaseId, "content_types", props.id, updatedData)
			props.navigate({screen: "list"})
		}
		catch (e) {
			setErrors([e])
		}
	}

	async function onDelete() {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.tx.delete(currentDatabaseId, "content_types", props.id)
			props.navigate({screen: "list"})
		}
		catch (e) {
			setErrors([e])
		}
	}

	return (
		<div>
			{errors.length > 0 && <ErrorCallout errors={errors} />}
			{contentTypeQuery.status === LiveQueryStatus.LOADING && (
				<p>Loading...</p>
			)}
			{contentTypeQuery.status === LiveQueryStatus.SUCCESS &&
        <ContentTypeForm
        	title={`Edit Content Type '${contentTypeQuery.result.data.name}'`}
        	data={contentTypeQuery.result.data}
        	onSave={onSave}
        	onDelete={onDelete}
        	navigate={props.navigate}
        />
			}
		</div>
	);
}