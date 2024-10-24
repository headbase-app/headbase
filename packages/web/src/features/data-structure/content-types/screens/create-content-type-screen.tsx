import React, { useState } from "react";
import { ErrorCallout } from "../../../../patterns/components/error-callout/error-callout";
import {ErrorTypes} from "@headbase-toolkit/control-flow";
import {
	GenericManagerScreenProps
} from "../../../../common/generic-manager/generic-manager";
import {
	ContentTypeData
} from "../../../../state/schemas/content-types/content-types";
import {ContentTypeForm} from "../forms/content-type-form";
import {HeadbaseTableSchemas, HeadbaseTableTypes} from "../../../../state/headbase-localful";
import {useLocalful} from "@headbase-toolkit/react/use-localful";

export function CreateContentTypeScreen(props: GenericManagerScreenProps) {
	const {currentDatabase} = useLocalful<HeadbaseTableTypes, HeadbaseTableSchemas>()
	const [errors, setErrors] = useState<unknown[]>([])

	async function onSave(data: ContentTypeData) {
		if (!currentDatabase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await currentDatabase.create('content_types', data)
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
