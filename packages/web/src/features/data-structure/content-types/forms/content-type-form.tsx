import { FormEvent, useEffect, useMemo, useState } from "react";
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
	JMultiSelectOptionData,
	JOptionData, JColourVariants, JSelect, JMultiSelect
} from "@ben-ryder/jigsaw-react";
import {GenericFormProps} from "../../../../common/generic-form/generic-form";
import {
	ContentTypeData
} from "../../../../state/schemas/content-types/content-types";
import {ColourVariants} from "../../../../state/schemas/common/fields";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";
import { FIELD_TYPES } from "../../../../state/schemas/fields/field-types";
import { ErrorCallout } from "../../../../patterns/components/error-callout/error-callout";
import {HeadbaseTableSchemas, HeadbaseTableTypes} from "../../../../state/headbase";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {useContentQuery} from "@headbase-toolkit/react/use-content-query";


export function ContentTypeForm(props: GenericFormProps<ContentTypeData>) {
	const {currentDatabaseId, headbase} = useHeadbase<HeadbaseTableTypes, HeadbaseTableSchemas>()
	const [errors, setErrors] = useState<unknown[]>([]);

	const [name, setName] = useState<string>(props.data.name);
	const [description, setDescription] = useState<string>(props.data.description || '');
	const [icon, setIcon] = useState<string>(props.data.icon || '');

	const [contentTemplateTags, setContentTemplateTags] = useState<JMultiSelectOptionData[]>([]);

	const allTags = useContentQuery(currentDatabaseId, {table: 'tags'})
	const tagOptions: JMultiSelectOptionData[] = allTags.status === LiveQueryStatus.SUCCESS
		? allTags.result.map(tag => ({
			text: tag.data.name,
			value: tag.id,
			variant: tag.data.colourVariant
		}))
		: []

	useEffect(() => {
		async function loadSelectedTags() {
			if (!currentDatabaseId || !headbase) return

			if (props.data.contentTemplateTags && props.data.contentTemplateTags.length > 0) {
				try {
					const selectedTags = await headbase.tx.getMany(currentDatabaseId, 'tags', props.data.contentTemplateTags)
					setContentTemplateTags(selectedTags.result.map(tag => ({
						text: tag.data.name,
						value: tag.id,
						variant: tag.data.colourVariant
					}))
					)
					if (Array.isArray(selectedTags.errors) && selectedTags.errors.length > 0) {
						setErrors((e) => {
							// @ts-expect-error -- todo: review this type issue.
							return [...e, ...selectedTags.errors]})
					}
				}
				catch (e) {
					setErrors((e) => {return [...e, e]})
				}
			}
		}
		loadSelectedTags()
	}, [currentDatabaseId, headbase])

	const [colour, setColour] = useState<ColourVariants | ''>(props.data.colourVariant || '');
	const colourVariantOptions: JOptionData[] = useMemo(() => {
		return [
			{ text: "-- Select Colour --", value: "" },
			...ColourVariants.options.map((variant) => ({
				// todo: replace with generic labels, not direct from Jigsaw
				text: JColourVariants[variant].label,
				value: variant
			}))
		];
	}, []);

	const [contentTemplateName, setContentTemplateName] = useState<string>(props.data.contentTemplateName || '');

	const [fieldOptions, setFieldOptions] = useState<JMultiSelectOptionData[]>([]);
	const allFields = useContentQuery(currentDatabaseId, {table: 'fields'})
	useEffect(() => {
		if (allFields.status === LiveQueryStatus.SUCCESS) {
			const fieldOptionMappings: JMultiSelectOptionData[] = allFields.status === LiveQueryStatus.SUCCESS
				? allFields.result.map(field => ({
					text: `${field.data.label} (${FIELD_TYPES[field.data.type].label})`,
					value: field.id,
				}))
				: []
			setFieldOptions(fieldOptionMappings)
		}
	}, [allFields])

	const [selectedFields, setSelectedFields] = useState<JMultiSelectOptionData[]>([]);
	useEffect(() => {
		async function loadSelectedFields() {
			if (!currentDatabaseId) return

			if (props.data.fields && props.data.fields.length > 0) {
				try {
					const selectedFields = await headbase.tx.getMany(currentDatabaseId, 'fields', props.data.fields)
					setSelectedFields(selectedFields.result.map(field => ({
						text: `${field.data.label} (${FIELD_TYPES[field.data.type].label})`,
						value: field.id,
					})))
					if (Array.isArray(selectedFields.errors) && selectedFields.errors.length > 0) {
						setErrors((e) => {
							// @ts-expect-error -- todo: review this type issue.
							return [...e, ...selectedTags.errors]})
					}
				}
				catch (newError) {
					setErrors((e) => {return [...e, newError]})
				}
			}
		}
		loadSelectedFields()
	}, [currentDatabaseId, headbase])


	function onSave(e: FormEvent) {
		e.preventDefault()

		const parseResult = ContentTypeData.safeParse({
			name,
			description,
			icon: icon || undefined,
			colourVariant: colour || undefined,
			contentTemplateName: contentTemplateName || undefined,
			contentTemplateTags: contentTemplateTags.map(t => t.value),
			fields: selectedFields.map(f => f.value)
		} as ContentTypeData)
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
				<h2>{props.title}</h2>
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
						value={colour}
						onChange={(e) => {setColour(e.target.value as ColourVariants|"")}}
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
						value={contentTemplateName}
						onChange={(e) => {
							setContentTemplateName(e.target.value);
						}}
						placeholder="a name template..."
					/>
					<JProse>
						<p>Can be used to autogenerate the name of content when created. Use <code>$date</code> for the current date in format <code>YYYY-MM-DD</code>.</p>
					</JProse>
				</JFormRow>
				<JFormRow>
					<JMultiSelect
						id="templateTags"
						label="Template Tags"
						options={tagOptions}
						selectedOptions={contentTemplateTags}
						setSelectedOptions={setContentTemplateTags}
						searchText="Search and select tags..."
						noOptionsText="No Tags Found"
					/>
				</JFormRow>
				<JProse>
					<hr/>
				</JProse>
				<JFormRow>
					<JMultiSelect
						id="fields"
						label="Fields"
						options={fieldOptions}
						selectedOptions={selectedFields}
						setSelectedOptions={setSelectedFields}
						searchText="Search and select fields..."
						noOptionsText="No Fields Found"
					/>
					<JProse>
						<p>Fields will be ordered as they are selected here.</p>
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
