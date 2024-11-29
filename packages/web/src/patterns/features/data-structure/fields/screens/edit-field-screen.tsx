import React, {ReactNode, useState} from "react";
import {ErrorCallout} from "../../../../patterns/components/error-callout/error-callout";
import {ErrorTypes} from "@headbase-toolkit/control-flow";
import {GenericManagerContentScreenProps,} from "../../../../common/generic-manager/generic-manager";
import {BasicFieldForm} from "../forms/basic-field-form";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {JArrowButton} from "@ben-ryder/jigsaw-react";
import {MarkdownFieldForm} from "../forms/markdown-field-form";
import { ScaleFieldForm } from "../forms/scale-field-form";
import { OptionsFieldForm } from "../forms/options-field-form";
import {useContent} from "@headbase-toolkit/react/use-content";
import {FieldDefinition} from "@headbase-toolkit/schemas/entities/fields/fields";
import {FIELD_TYPES} from "@headbase-toolkit/schemas/entities/fields/field-types";


export function EditFieldScreen(props: GenericManagerContentScreenProps) {
	const {currentDatabaseId, headbase} = useHeadbase()
	const [errors, setErrors] = useState<unknown[]>([])

	const fieldQuery = useContent(currentDatabaseId, "fields", props.id)

	async function onSave(updatedData: Partial<FieldDefinition>) {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.tx.update(currentDatabaseId, 'fields', props.id, updatedData)
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