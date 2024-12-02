import React, {ReactNode, useState} from "react";
import {BasicFieldForm} from "../forms/basic-field-form";
import {JArrowButton} from "@ben-ryder/jigsaw-react";
import {MarkdownFieldForm} from "../forms/markdown-field-form";
import { ScaleFieldForm } from "../forms/scale-field-form";
import { OptionsFieldForm } from "../forms/options-field-form";
import {useHeadbase} from "../../../../../logic/react/use-headbase.tsx";
import {GenericManagerContentScreenProps} from "../../../common/generic-manager/generic-manager.tsx";
import {useField} from "../../../../../logic/react/tables/use-field.tsx";
import {ErrorTypes} from "../../../../../logic/control-flow.ts";
import {UpdateFieldDto} from "../../../../../logic/schemas/fields/dtos.ts";

export function EditFieldScreen(props: GenericManagerContentScreenProps) {
	const {currentDatabaseId, headbase} = useHeadbase()
	const [errors, setErrors] = useState<unknown[]>([])

	const fieldQuery = useField(props.id)

	// todo: better type?
	async function onSave(updatedData: Omit<UpdateFieldDto, 'createdBy'>) {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.db.updateField(props.id, updatedData)
			props.navigate({screen: "list"})
		}
		catch (e) {
			setErrors([e])
		}
	}

	async function onDelete() {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.tx.delete(currentDatabaseId, 'fields', props.id)
			props.navigate({screen: "list"})
		}
		catch (e) {
			setErrors([e])
		}
	}

	let content: ReactNode
	if (fieldQuery.status === 'loading') {
		content = <p>loading...</p>
	}
	else if (fieldQuery.status === 'error') {
		content = <ErrorCallout errors={fieldQuery.errors} />
	}
	else if (fieldQuery.result.data.type === 'markdown') {
		content = (
			<MarkdownFieldForm
				data={fieldQuery.result.data}
				onSave={onSave}
				onDelete={onDelete}
				navigate={props.navigate}
			/>
		)
	}
	else if (fieldQuery.result.data.type === 'options') {
		content = (
			<OptionsFieldForm
				data={fieldQuery.result.data}
				onSave={onSave}
				navigate={props.navigate}
			/>
		)
	}
	else if (fieldQuery.result.data.type === 'scale') {
		content = (
			<ScaleFieldForm
				data={fieldQuery.result.data}
				onSave={onSave}
				navigate={props.navigate}
			/>
		)
	}
	else {
		content = (
			<BasicFieldForm
				data={fieldQuery.result.data}
				onSave={onSave}
				onDelete={onDelete}
				navigate={props.navigate}
			/>
		)
	}

	return (
		<div>
			<JArrowButton
				onClick={() => {
					props.navigate({screen: "list"})
				}}
				direction="left"
			>All Fields</JArrowButton>
			{errors.length > 0 && <ErrorCallout errors={errors} />}
			{fieldQuery.status === 'success' && (
				<h2>{`Edit ${FIELD_TYPES[fieldQuery.result.data.type].label} Field '${fieldQuery.result.data.label}'`}</h2>
			)}
			{content}
		</div>
	);
}