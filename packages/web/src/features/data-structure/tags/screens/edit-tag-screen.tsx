import React, { useState } from "react";
import { TagForm } from "../forms/tag-form";
import { ErrorCallout } from "../../../../patterns/components/error-callout/error-callout";
import { TagData } from "../../../../state/schemas/tags/tags";
import {ErrorTypes, LiveQueryStatus} from "@headbase-toolkit/control-flow";
import {
	GenericManagerContentScreenProps,
} from "../../../../common/generic-manager/generic-manager";
import {HeadbaseTableSchemas, HeadbaseTableTypes} from "../../../../state/headbase";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {useContent} from "@headbase-toolkit/react/use-content";


export function EditTagScreen(props: GenericManagerContentScreenProps) {
	const {currentDatabaseId, headbase} = useHeadbase<HeadbaseTableTypes, HeadbaseTableSchemas>()
	const [errors, setErrors] = useState<unknown[]>([])

	const tagResult = useContent(currentDatabaseId, 'tag', props.id)

	async function onSave(updatedData: Partial<TagData>) {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.tx.update(currentDatabaseId, 'tags', props.id, updatedData)
			props.navigate({screen: "list"})
		}
		catch (e) {
			setErrors([e])
		}
	}

	async function onDelete() {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.tx.delete(currentDatabaseId, 'tags', props.id)
			props.navigate({screen: "list"})
		}
		catch (e) {
			setErrors([e])
		}
	}

	return (
		<div>
			{errors.length > 0 && <ErrorCallout errors={errors} />}
			{tagResult.status === LiveQueryStatus.LOADING && (
				<p>Loading...</p>
			)}
			{tagResult.status === LiveQueryStatus.SUCCESS &&
        <TagForm
        	title={`Edit Tag '${tagResult.result.data.name}'`}
        	data={{
        		name: tagResult.result.data.name,
        		colourVariant: tagResult.result.data.colourVariant,
        	}}
        	onSave={onSave}
        	onDelete={onDelete}
        	navigate={props.navigate}
        />
			}
		</div>
	);
}