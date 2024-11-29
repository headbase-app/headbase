import React, { useState } from "react";
import { ErrorCallout } from "../../../../patterns/components/error-callout/error-callout";
import {ErrorTypes} from "@headbase-toolkit/control-flow";
import {
	GenericManagerScreenProps
} from "../../../../common/generic-manager/generic-manager";
import { TagForm } from "../forms/tag-form";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {TagData} from "@headbase-toolkit/schemas/entities/tags";

export function CreateTagScreen(props: GenericManagerScreenProps) {
	const {currentDatabaseId, headbase} = useHeadbase()
	const [errors, setErrors] = useState<unknown[]>([])

	async function onSave(data: TagData) {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.tx.create(currentDatabaseId, 'tags', data)
			props.navigate({screen: "list"})
		}
		catch (e) {
			console.debug(e)
			setErrors([e])
		}
	}

	return (
		<>
			{errors.length > 0 && <ErrorCallout errors={errors} />}
			<TagForm
				title="Create Tag"
				data={{ name: "", colourVariant: undefined }}
				onSave={onSave}
				navigate={props.navigate}
			/>
		</>
	);
}