import {FormEvent, ReactNode, useEffect, useState} from "react";
import {
	JInput,
	JErrorText,
	JButtonGroup, JButton,
	JForm, JFormContent, JFormRow, JMultiSelectOptionData, JMultiSelect, JSelect, JProse
} from "@ben-ryder/jigsaw-react";
import { useContentQuery } from "@headbase-toolkit/react/use-content-query";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";
import { WithTabData } from "../../workspace/workspace";
import {ContentFormData, ContentFormDataHandlers} from "./useContentFormData";

import "./content-form.scss"
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {CustomField} from "./field";
import {TableSchema, TableTypes} from "@headbase-toolkit/schemas/schema";
import {FieldDefinition} from "@headbase-toolkit/schemas/fields/fields";
import {EntityDto} from "@headbase-toolkit/schemas/entities";

export interface ContentFormProps extends WithTabData, ContentFormData, ContentFormDataHandlers {
	fields?: string[]
	onSave: () => void;
	onDelete?: () => void;
}

export interface ContentFormFields {
	[key: string]: EntityDto<FieldDefinition>
}

// todo: handle situation where content form is open and content gets deleted?

export function ContentForm(props: ContentFormProps) {
	const {headbase, currentDatabaseId} = useHeadbase<TableTypes, TableSchema>()
	const [error, setError] = useState<string | null>(null);

	const tagQuery = useContentQuery(currentDatabaseId, {table: 'tags'})
	const tagOptions: JMultiSelectOptionData[] = tagQuery.status === LiveQueryStatus.SUCCESS
		? tagQuery.result.map(tag => ({
			text: tag.data.name,
			value: tag.id,
			variant: tag.data.colourVariant
		}))
		: []

	const [contentTypeFields, setContentTypeFields] = useState<ContentFormFields>({})
	useEffect(() => {
		if (!headbase || !currentDatabaseId || !props.fields) return

		const contentQuery = headbase.tx.liveGetMany(currentDatabaseId, 'fields', props.fields)
		const subscription = contentQuery.subscribe((liveQuery) => {
			if (liveQuery.status === 'success') {
				const fields: ContentFormFields = {}
				for (const field of liveQuery.result) {
					fields[field.id] = field
				}
				setContentTypeFields(fields)
			}
			else {
				setContentTypeFields({})
			}
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [props.fields, headbase, currentDatabaseId]);

	function onSave(e: FormEvent) {
		e.preventDefault()

		if (props.name.length === 0) {
			setError("Your content must have a name");
		}
		else {
			setError(null);
			props.onSave();
		}
	}

	const fields: ReactNode[] = []
	for (const fieldId of props?.fields || []) {
		const field = contentTypeFields[fieldId]
		if (field) {
			const fieldValue = props.fieldStorage[fieldId]?.value
			fields.push(
				<JFormRow>
					<CustomField field={field.data} value={fieldValue} onChange={(newValue) => {
						props.onFieldStorageChange(field.id, {type: field.data.type, value: newValue})
					}} />
				</JFormRow>
			)
		}
	}

	return (
		<JForm className="content-form" onSubmit={onSave}>
			<div className="content-form__header">
				{error && <JErrorText>{error}</JErrorText>}
			</div>
			<JFormContent>
				<JFormRow>
					<JInput
						label="Name"
						id="name"
						type="text"
						value={props.name}
						onChange={(e) => {
							props.onNameChange(e.target.value);
						}}
						placeholder="your content name..."
					/>
				</JFormRow>
				<JFormRow>
					<JSelect
						label="Favourite?"
						id="favourite"
						value={props.isFavourite ? 'yes' : 'no'}
						onChange={(e) => {
							props.onIsFavouriteChange(e.target.value === 'yes');
						}}
						options={[
							{
								text: 'No',
								value: 'no'
							},
							{
								text: 'Yes',
								value: 'yes'
							}
						]}
					/>
				</JFormRow>
				<JFormRow>
					<JMultiSelect
						id="tags"
						label="Tags"
						options={tagOptions}
						selectedOptions={
							props.tags
								? tagOptions.filter(option => props.tags.includes(option.value))
								: []
						}
						setSelectedOptions={(tags) => {
							props.onTagsChange(tags.map(option => option.value))
						}}
						searchText="search and select tags..."
						noOptionsText="No Tags Found"
					/>
				</JFormRow>

				{fields.length > 0 && (
					<>
						<JProse>
							<hr />
						</JProse>
						{fields}
					</>
				)}
			</JFormContent>

			<JFormRow>
				<JButtonGroup>
					{props.onDelete &&
            <JButton
            	type="button"
            	variant="destructive"
            	onClick={() => {
            		if (props.onDelete) {
            			props.onDelete()
            		}
            	}}
            >Delete</JButton>
					}
					<JButton type="submit">Save</JButton>
				</JButtonGroup>
			</JFormRow>
		</JForm>
	);
}
