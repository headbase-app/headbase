import React, { useState } from "react";
import { ErrorCallout } from "../../../../patterns/components/error-callout/error-callout";
import {ErrorTypes, LiveQueryStatus} from "@headbase-toolkit/control-flow";
import {
	GenericManagerContentScreenProps,
} from "../../../../common/generic-manager/generic-manager";
import {ContentTypeForm} from "../forms/content-type-form";
import {
	ContentTypeData
} from "../../../../state/schemas/content-types/content-types";
import { useObservableQuery } from "@headbase-toolkit/react/use-observable-query";
import {HeadbaseTableSchemas, HeadbaseTableTypes} from "../../../../state/headbase-localful";
import {useLocalful} from "@headbase-toolkit/react/use-localful";

export function EditContentTypeScreen(props: GenericManagerContentScreenProps) {
	const {currentDatabase} = useLocalful<HeadbaseTableTypes, HeadbaseTableSchemas>()
	const [errors, setErrors] = useState<unknown[]>([])

	const contentTypeQuery = useObservableQuery(currentDatabase?.liveGet('content_types', props.id))

	async function onSave(updatedData: Partial<ContentTypeData>) {
		if (!currentDatabase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await currentDatabase.update("content_types", props.id, updatedData)
			props.navigate({screen: "list"})
		}
		catch (e) {
			setErrors([e])
		}
	}

	async function onDelete() {
		if (!currentDatabase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await currentDatabase.delete("content_types", props.id)
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