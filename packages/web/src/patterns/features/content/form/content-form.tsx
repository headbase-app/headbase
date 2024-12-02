import {FormEvent, ReactNode, useEffect, useState} from "react";
import {
	JInput,
	JErrorText,
	JButtonGroup, JButton,
	JForm, JFormContent, JFormRow, JSelect, JProse
} from "@ben-ryder/jigsaw-react";
import { WithTabData } from "../../workspace/workspace";
import {ContentFormData, ContentFormDataHandlers} from "./useContentFormData";

import "./content-form.scss"
import {CustomField} from "./field";
import {useHeadbase} from "../../../../logic/react/use-headbase.tsx";
import {FieldDto} from "../../../../logic/schemas/fields/dtos.ts";
import {FieldStorage} from "../../../../logic/schemas/common/field-storage.ts";

export interface ContentFormProps extends WithTabData, ContentFormData, ContentFormDataHandlers {
	fields?: FieldStorage
	onSave: () => void;
	onDelete?: () => void;
}

export interface ContentFormFields {
	[key: string]: FieldDto
}

// todo: handle situation where content form is open and content gets deleted?

export function ContentForm(props: ContentFormProps) {
	const {headbase, currentDatabaseId} = useHeadbase()
	const [error, setError] = useState<string | null>(null);

	const [contentTypeFields, setContentTypeFields] = useState<ContentFormFields>({})
	useEffect(() => {
		if (!headbase || !currentDatabaseId || !props.fields) return

		const contentQuery = headbase.db.liveQueryFields()
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
	for (const fieldId of props.fields ? Object.keys(props.fields) : []) {
		const field = contentTypeFields[fieldId]
		if (field) {
			const fieldValue = props.fieldStorage[fieldId]?.value
			fields.push(
				<JFormRow>
					<CustomField field={field} value={fieldValue} onChange={(newValue) => {
						props.onFieldStorageChange(field.id, {type: field.type, value: newValue})
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
