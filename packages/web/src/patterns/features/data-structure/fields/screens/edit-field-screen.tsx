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
import {FieldData} from "../../../../../logic/schemas/fields/dtos.ts";
import {ErrorCallout} from "../../../../components/error-callout/error-callout.tsx";
import {FIELDS} from "../../../../../logic/schemas/fields/types.ts";


export function EditFieldScreen(props: GenericManagerContentScreenProps) {
	const {currentDatabaseId, headbase} = useHeadbase()
	const [errors, setErrors] = useState<unknown[]>([])

	const fieldQuery = useField(props.id)

	async function onSave(updatedData: FieldData) {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.db.updateField(props.id, {...updatedData, createdBy: 'todo'})
			props.navigate({screen: "list"})
		}
		catch (e) {
			setErrors([e])
		}
	}

	async function onDelete() {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.db.deleteField(props.id)
			props.navigate({screen: "list"})
		}
		catch (e) {
			console.error(e)
			setErrors([e])
		}
	}

	if (fieldQuery.status === 'loading') {
		return <p>loading...</p>
	}
	else if (fieldQuery.status === 'error') {
		return <ErrorCallout errors={fieldQuery.errors} />
	}

	let content: ReactNode
	if (fieldQuery.result.type === 'markdown') {
		content = (
			<MarkdownFieldForm
				data={fieldQuery.result}
				onSave={onSave}
				onDelete={onDelete}
				navigate={props.navigate}
			/>
		)
	}
	else if (
		fieldQuery.result.type === 'referenceOne' ||
		fieldQuery.result.type === 'referenceMany' ||
		fieldQuery.result.type === 'selectMany' ||
		fieldQuery.result.type === 'point' ||
		fieldQuery.result.type === 'files' ||
		fieldQuery.result.type === 'images'
	) {
		content = (
			<p>Field not supported yet</p>
		)
	}
	else if (fieldQuery.result.type === 'selectOne') {
		content = (
			<OptionsFieldForm
				data={fieldQuery.result}
				onSave={onSave}
				onDelete={onDelete}
				navigate={props.navigate}
			/>
		)
	}
	else if (fieldQuery.result.type === 'scale') {
		content = (
			<ScaleFieldForm
				data={fieldQuery.result}
				onSave={onSave}
				onDelete={onDelete}
				navigate={props.navigate}
			/>
		)
	}
	else {
		content = (
			<BasicFieldForm
				data={fieldQuery.result}
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
				<h2>{`Edit ${FIELDS[fieldQuery.result.type].label} Field '${fieldQuery.result.name}'`}</h2>
			)}
			{content}
		</div>
	);
}