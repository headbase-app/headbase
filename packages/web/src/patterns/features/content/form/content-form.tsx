import {FormEvent, useState} from "react";
import {
	JInput,
	JErrorText,
	JButtonGroup, JButton,
	JForm, JFormContent, JFormRow, JTextArea
} from "@ben-ryder/jigsaw-react";
import { WithTabData } from "../../workspace/workspace";
import {ObjectFormData, ObjectFormDataHandlers} from "./useObjectFormData.ts";

import "./content-form.scss"
import {useHeadbase} from "../../../../logic/react/use-headbase.tsx";

export interface ContentFormProps extends WithTabData, ObjectFormData, ObjectFormDataHandlers {
	onSave: () => void;
	onDelete?: () => void;
}

// todo: handle situation where content form is open and content gets deleted?

export function ContentForm(props: ContentFormProps) {
	const {headbase, currentDatabaseId} = useHeadbase()
	const [error, setError] = useState<string | null>(null);

	function onSave(e: FormEvent) {
		e.preventDefault()
		props.onSave();
	}

	return (
		<JForm className="content-form" onSubmit={onSave}>
			<div className="content-form__header">
				{error && <JErrorText>{error}</JErrorText>}
			</div>
			<JFormContent>
				<JFormRow>
					<JInput
						label="Type"
						id="type"
						type="text"
						required
						tooltip={{content: "Defines the type of the object"}}
						value={props.type}
						onChange={(e) => {
							props.onTypeChange(e.target.value);
						}}
						placeholder="an object type..."
					/>
				</JFormRow>
				<JFormRow>
					<JTextArea
						label="Data"
						id="data"
						rows={10}
						required
						tooltip={{content: "JSON data for the object"}}
						placeholder="your object data (should be a JSON object)"
						value={props.data}
						onChange={(e) => {
							props.onDataChange(e.target.value);
						}}
					/>
				</JFormRow>
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
