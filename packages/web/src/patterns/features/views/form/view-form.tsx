import {FormEvent, useState} from "react";
import {
	JInput,
	JErrorText,
	JButtonGroup, JButton,
	JForm, JFormContent, JFormRow, JMultiSelectOptionData, JTextArea, JMultiSelect, JSelect
} from "@ben-ryder/jigsaw-react";
import { WithTabData } from "../../workspace/workspace";
import { ViewFormData, ViewFormDataHandlers } from "./useViewFormData";

import "./view-form.scss"
import {useContentTypeQuery} from "../../../../logic/react/tables/use-type-query.tsx";
import {LiveQueryStatus} from "../../../../logic/control-flow.ts";


export interface ViewFormProps extends WithTabData, ViewFormData, ViewFormDataHandlers {
	onSave: () => void;
	onDelete?: () => void;
}

// todo: handle situation where content form is open and content gets deleted?

export function ViewForm(props: ViewFormProps) {
	const [error, setError] = useState<string | null>(null);

	const allContentTypes = useContentTypeQuery({filter: {isDeleted: false}});
	const contentTypeOptions: JMultiSelectOptionData[] = allContentTypes.status === LiveQueryStatus.SUCCESS
		? allContentTypes.result.map(contentType => ({
			text: contentType.name,
			value: contentType.id,
			variant: contentType.colour ? contentType.colour : undefined
		}))
		: []

	function onSave(e: FormEvent) {
		e.preventDefault()

		if (props.name.length === 0) {
			setError("Your view must have a name");
		}
		else {
			setError(null);
			props.onSave();
		}
	}

	return (
		<JForm className="view-form" onSubmit={onSave}>
			<div className="view-form__header">
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
						placeholder="your view name..."
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
					<JTextArea
						label="Description"
						id="description"
						value={props.description || ''}
						rows={3}
						onChange={(e) => {
							props.onDescriptionChange(e.target.value);
						}}
						placeholder="a short descripction of your view..."
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
