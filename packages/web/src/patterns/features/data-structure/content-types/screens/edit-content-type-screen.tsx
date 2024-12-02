import React, { useState } from "react";
import {ContentTypeForm} from "../forms/content-type-form";
import {useHeadbase} from "../../../../../logic/react/use-headbase.tsx";
import {GenericManagerContentScreenProps} from "../../../common/generic-manager/generic-manager.tsx";
import {useContentType} from "../../../../../logic/react/tables/use-type.tsx";
import {ContentTypeData} from "../../../../../logic/schemas/content-types/dtos.ts";
import {ErrorTypes, LiveQueryStatus} from "../../../../../logic/control-flow.ts";
import {ErrorCallout} from "../../../../components/error-callout/error-callout.tsx";

export function EditContentTypeScreen(props: GenericManagerContentScreenProps) {
	const {currentDatabaseId, headbase} = useHeadbase()
	const [errors, setErrors] = useState<unknown[]>([])

	const contentTypeQuery = useContentType(props.id)

	async function onSave(updatedData: ContentTypeData) {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.db.updateType(props.id, {
				...updatedData,
				createdBy: 'todo',
			})
			props.navigate({screen: "list"})
		}
		catch (e) {
			setErrors([e])
		}
	}

	async function onDelete() {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.db.deleteType(props.id)
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
        	title={`Edit Content Type '${contentTypeQuery.result.name}'`}
        	data={contentTypeQuery.result}
        	onSave={onSave}
        	onDelete={onDelete}
        	navigate={props.navigate}
        />
			}
		</div>
	);
}