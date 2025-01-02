import React, {ReactNode, useState} from "react";
import {BasicFieldForm} from "../forms/basic-field-form";
import { JArrowButton, JButton } from "@ben-ryder/jigsaw-react";
import {MarkdownFieldForm} from "../forms/markdown-field-form";
import { ScaleFieldForm } from "../forms/scale-field-form";
import { OptionsFieldForm } from "../forms/options-field-form";
import {GenericManagerScreenProps} from "../../../common/generic-manager/generic-manager.tsx";
import {useHeadbase} from "../../../../../logic/react/use-headbase.tsx";
import {FIELDS, FieldTypes} from "../../../../../logic/schemas/fields/types.ts";
import {ErrorTypes} from "../../../../../logic/control-flow.ts";
import {ErrorCallout} from "../../../../components/error-callout/error-callout.tsx";
import {FieldData} from "../../../../../logic/schemas/fields/dtos.ts";


export function CreateFieldScreen(props: GenericManagerScreenProps) {
	const [errors, setErrors] = useState<unknown[]>([])
	const { currentDatabaseId, headbase } = useHeadbase()

	const [fieldType, setFieldType] = useState<FieldTypes|null>(null);

	async function onSave(data: FieldData) {
		if (!currentDatabaseId || !headbase) return setErrors([{type: ErrorTypes.NO_CURRENT_DATABASE}])

		try {
			await headbase.db.fields.create({
				...data,
				createdBy: 'todo',
			})
			props.navigate({screen: "list"})
		}
		catch (e) {
			console.error(e)
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
					<JButton onClick={() => {setFieldType('url')}}>URL</JButton>
					<JButton onClick={() => {setFieldType('email')}}>Email</JButton>
					<JButton onClick={() => {setFieldType('colour')}}>Colour</JButton>
					<JButton onClick={() => {setFieldType('phone')}}>Phone</JButton>
					<JButton onClick={() => {setFieldType('boolean')}}>Boolean</JButton>
					<JButton onClick={() => {setFieldType('number')}}>Number</JButton>
					<JButton onClick={() => {setFieldType('date')}}>Date</JButton>
					<JButton onClick={() => {setFieldType('timestamp')}}>Timestamp</JButton>
				</div>
				<div>
					<JButton onClick={() => {setFieldType('referenceOne')}}>Reference (one)</JButton>
					<JButton onClick={() => {setFieldType('referenceMany')}}>Reference (many)</JButton>
				</div>
				<div>
					<JButton onClick={() => {setFieldType('selectOne')}}>Select (one)</JButton>
					<JButton onClick={() => {setFieldType('selectMany')}}>Select (many)</JButton>
				</div>
				<div>
					<JButton onClick={() => {setFieldType('scale')}}>Scale</JButton>
					<JButton onClick={() => {setFieldType('point')}}>Point</JButton>
					<JButton onClick={() => {setFieldType('files')}}>Files</JButton>
					<JButton onClick={() => {setFieldType('images')}}>Images</JButton>
				</div>
			</div>
		)
	}

	let createForm: ReactNode
	if (fieldType === 'markdown') {
		createForm = (
			<MarkdownFieldForm
				data={{type: 'markdown', name: '', description: null, icon: null, settings: {defaultLines: 5}}}
				onSave={onSave}
				navigate={props.navigate}
			/>
		)
	}
	else if (fieldType === 'selectOne') {
		createForm = (
			<OptionsFieldForm
				data={{
					type: "selectOne",
					name: "",
					description: null,
					icon: null,
					settings: {
						options: []
					}
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
					name: "",
					description: null,
					icon: null,
					settings: {
						scale: 5,
						minLabel: "",
						maxLabel: "",
					}
				}}
				onSave={onSave}
				navigate={props.navigate}
			/>
		)
	}
	else if (
		fieldType === 'referenceOne' ||
		fieldType === 'referenceMany' ||
		fieldType === 'selectMany' ||
		fieldType === 'point' ||
		fieldType === 'files' ||
		fieldType === 'images'
	) {
		createForm = (
			<p>Field not supported yet</p>
		)
	}
	else {
		createForm = (
			<BasicFieldForm
				data={{ type: fieldType, name: "", description: null, icon: null }}
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
			<h2>{`Create ${FIELDS[fieldType].label} Field`}</h2>
			<div>
				{errors.length > 0 && <ErrorCallout errors={errors} />}
			</div>
			<div>
				{createForm}
			</div>
		</div>
	)
}
