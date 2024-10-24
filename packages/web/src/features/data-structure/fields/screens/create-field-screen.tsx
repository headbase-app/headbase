import React, {ReactNode, useState} from "react";
import { ErrorCallout } from "../../../../patterns/components/error-callout/error-callout";
import {ErrorTypes} from "@headbase-toolkit/control-flow";
import {
	GenericManagerScreenProps
} from "../../../../common/generic-manager/generic-manager";
import { FieldDefinition } from "../../../../state/schemas/fields/fields";
import {BasicFieldForm} from "../forms/basic-field-form";
import {HeadbaseTableSchemas, HeadbaseTableTypes} from "../../../../state/headbase";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import { JArrowButton, JButton } from "@ben-ryder/jigsaw-react";
import {FIELD_TYPES, FieldTypes} from "../../../../state/schemas/fields/field-types";
import {MarkdownFieldForm} from "../forms/markdown-field-form";
import { ScaleFieldForm } from "../forms/scale-field-form";
import { OptionsFieldForm } from "../forms/options-field-form";

export function CreateFieldScreen(props: GenericManagerScreenProps) {
	const [errors, setErrors] = useState<unknown[]>([])
	const { currentDatabase } = useHeadbase<HeadbaseTableTypes, HeadbaseTableSchemas>()

	const [fieldType, setFieldType] = useState<FieldTypes|null>(null);

	async function onSave(data: FieldDefinition) {
		if (!currentDatabase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await currentDatabase.create('fields', data)
			props.navigate({screen: "list"})
		}
		catch (e) {
			setErrors([e])
		}
	}

	if (!fieldType) {
		return (
			<div>
				<JArrowButton
					onClick={() => {
						props.navigate({screen: "list"})
					}}
					direction="left"
				>All Fields</JArrowButton>

				<p>Select field to create...</p>
				<div>
					<JButton onClick={() => {setFieldType('textShort')}}>Short Text</JButton>
					<JButton onClick={() => {setFieldType('textLong')}}>Long Text</JButton>
					<JButton onClick={() => {setFieldType('markdown')}}>Markdown</JButton>
				</div>
				<div>
					<JButton onClick={() => {setFieldType('options')}}>Options</JButton>
					<JButton onClick={() => {setFieldType('url')}}>URL</JButton>
				</div>
				<div>
					<JButton onClick={() => {setFieldType('number')}}>Number</JButton>
					<JButton onClick={() => {setFieldType('scale')}}>Scale</JButton>
					<JButton onClick={() => {setFieldType('boolean')}}>Boolean</JButton>
				</div>
				<div>
					<JButton onClick={() => {setFieldType('date')}}>Date</JButton>
					<JButton onClick={() => {setFieldType('timestamp')}}>Timestamp</JButton>
				</div>
			</div>
		)
	}

	let createForm: ReactNode
	if (fieldType === 'markdown') {
		createForm = (
			<MarkdownFieldForm
				data={{type: "markdown", label: "", lines: 3, required: false}}
				onSave={onSave}
				navigate={props.navigate}
			/>
		)
	}
	else if (fieldType === 'options') {
		createForm = (
			<OptionsFieldForm
				data={{
					type: "options",
					label: "",
					required: false,
					description: "",
					options: []
				}}
				onSave={onSave}
				navigate={props.navigate}
			/>
		)
	}
	else if (fieldType === 'scale') {
		createForm = (
			<ScaleFieldForm
				data={{
					type: "scale",
					label: "",
					required: false,
					minLabel: "",
					maxLabel: "",
					scale: 5,
				}}
				onSave={onSave}
				navigate={props.navigate}
			/>
		)
	}
	else {
		createForm = (
			<BasicFieldForm
				data={{ label: "", type: fieldType, required: false }}
				onSave={onSave}
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
			>Back</JArrowButton>
			<h2>{`Create ${FIELD_TYPES[fieldType].label} Field`}</h2>
			<div>
				{errors.length > 0 && <ErrorCallout errors={errors} />}
			</div>
			<div>
				{createForm}
			</div>
		</div>
	)
}
