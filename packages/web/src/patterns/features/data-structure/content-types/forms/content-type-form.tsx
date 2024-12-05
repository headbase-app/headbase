import { FormEvent, useMemo, useState } from "react";
import {
	JInput,
	JButtonGroup,
	JButton,
	JArrowButton,
	JForm,
	JFormContent,
	JFormRow,
	JTextArea,
	JProse,
	JOptionData, JColourVariants, JSelect, JColourVariantsList, JTable
} from "@ben-ryder/jigsaw-react";
import {
	ContentTypeData,
} from "../../../../../logic/schemas/content-types/dtos.ts";
import {LiveQueryStatus} from "../../../../../logic/control-flow.ts";
import {useFieldQuery} from "../../../../../logic/react/tables/use-field-query.tsx";
import {ErrorCallout} from "../../../../components/error-callout/error-callout.tsx";
import {FieldStorage} from "../../../../../logic/schemas/common/field-storage.ts";
import {GenericFormProps} from "../../../common/generic-form/generic-form.tsx";

export function ContentTypeForm(props: GenericFormProps<ContentTypeData>) {
	const [errors, setErrors] = useState<unknown[]>([]);

	const [name, setName] = useState<string>(props.data?.name || '');
	const [description, setDescription] = useState<string>(props.data?.description || '');
	const [icon, setIcon] = useState<string>(props.data?.icon || '');

	const [colour, setColour] = useState<JColourVariants | null>(props.data?.colour || null);
	const colourVariantOptions: JOptionData[] = useMemo(() => {
		return [
			{ text: "-- Select Colour --", value: "" },
			...JColourVariantsList.map((variant) => ({
				// todo: replace with generic labels, not direct from Jigsaw
				text: variant,
				value: variant
			}))
		];
	}, []);

	const [templateName, setTemplateName] = useState<string>(props.data?.templateName || '');

	const allFields = useFieldQuery({filter: {isDeleted: false}});

	const [selectedFields, setSelectedFields] = useState<string>('');

	function onSave(e: FormEvent) {
		e.preventDefault()

		if (!(allFields.status === 'success')) {
			throw new Error('Attempted to save before fields were loaded.')
		}

		const templateFields: FieldStorage = {}
		const fieldDeclarations = selectedFields.split('')
		for (const fieldsDeclaration of fieldDeclarations) {
			const [fieldId, defaultValue] = fieldsDeclaration.split(":")

			const matchingField = allFields.result.filter(field => field.id === fieldId)
			if (matchingField[0]) {
				templateFields[fieldId] = {
					type: matchingField[0].type,
					value: JSON.parse(defaultValue)
				}
			}
		}

		const parseResult = ContentTypeData.safeParse({
			name,
			description,
			icon,
			colour,
			templateName,
			templateFields
		})
		if (!parseResult.success) {
			console.error(parseResult.error)
			return
		}

		setErrors([]);
		props.onSave(parseResult.data);
	}

	return (
		<JForm className="content-form" onSubmit={onSave}>
			<div className="content-form__back">
				<JArrowButton
					onClick={() => {
						props.navigate({screen: "list"})
					}}
					direction="left"
				>Back</JArrowButton>
			</div>
			<div className="tag-form__header">
				<h2>{props.data.name}</h2>
				{errors.length > 0 && <ErrorCallout errors={errors} />}
			</div>
			<JFormContent>
				<JFormRow>
					<JInput
						label="Name"
						id="name"
						type="text"
						value={name}
						onChange={(e) => {
							setName(e.target.value);
						}}
						placeholder="name your content type..."
					/>
				</JFormRow>
				<JFormRow>
					<JTextArea
						label="Description"
						id="description"
						value={description}
						rows={3}
						onChange={(e) => {
							setDescription(e.target.value);
						}}
						placeholder="describe what your content type is etc..."
					/>
				</JFormRow>
				<JFormRow>
					<JInput
						label="Icon"
						id="icon"
						type="text"
						value={icon}
						onChange={(e) => {
							setIcon(e.target.value);
						}}
						placeholder="notebook,list-todo or wheat etc... "
					/>
					<JProse>
						<p>This can be any icon name from <a href="https://lucide.dev/icons/" target="_blank" rel="noreferrer">Lucide Icons</a>.</p>
					</JProse>
				</JFormRow>
				<JFormRow>
					<JSelect
						id="variant"
						label="Colour"
						options={colourVariantOptions}
						value={colour || undefined}
						onChange={(e) => {setColour(e.target.value as JColourVariants|null)}}
					/>
				</JFormRow>
				<JProse>
					<hr/>
				</JProse>
				<JFormRow>
					<JInput
						label="Template Name"
						id="templateName"
						type="text"
						value={templateName}
						onChange={(e) => {
							setTemplateName(e.target.value);
						}}
						placeholder="a name template..."
					/>
					<JProse>
						<p>Can be used to autogenerate the name of content when created. Use <code>$date</code> for the current date in format <code>YYYY-MM-DD</code>.</p>
					</JProse>
				</JFormRow>
				<JProse>
					<hr/>
				</JProse>
				<JFormRow>
					<JTextArea
						id="fields"
						label="Fields"
						placeholder="Content tyoe fields...."
						value={selectedFields}
						onChange={(e) => {setSelectedFields(e.target.value)}}
					/>
					<JProse>
						<p>Enter one field per line in the format <code>fieldId:defaultValue</code>.</p>

						{allFields.status === LiveQueryStatus.SUCCESS && (
							<JTable>
								<thead>
									<tr>
										<th>Name</th>
										<th>ID</th>
										<th>Type</th>
									</tr>
								</thead>
								<tbody>
									{allFields.result.map(field => (
										<tr>
											<td>{field.name}</td>
											<td>{field.id}</td>
											<td>{field.type}</td>
										</tr>
									))}
								</tbody>
							</JTable>
						)}
					</JProse>
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
