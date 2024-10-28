import { FormEvent, useMemo, useState } from "react";
import {
	JInput,
	JErrorText,
	JSelect,
	JPill,
	JLabel,
	JOptionData, JColourVariants, JButtonGroup, JButton, JArrowButton, JForm, JFormContent, JFormRow
} from "@ben-ryder/jigsaw-react";
import "./tag-form.scss";
import {GenericFormProps} from "../../../../common/generic-form/generic-form";
import {TagData} from "@headbase-toolkit/schemas/tags/tags";
import {ColourVariants} from "@headbase-toolkit/schemas/common/fields";


export function TagForm(props: GenericFormProps<TagData>) {
	const [error, setError] = useState<string | null>(null);

	const [name, setName] = useState<string>(props.data.name);
	const [colourVariant, setColourVariant] = useState<ColourVariants|"">(
		props.data.colourVariant || "",
	);

	const tagVariantOptions: JOptionData[] = useMemo(() => {
		return [
			{ text: "-- Select Colour --", value: "" },
			...ColourVariants.options.map((variant) => ({
				// todo: replace with generic labels, not direct from Jigsaw
				text: JColourVariants[variant].label,
				value: variant
			}))
		];
	}, []);

	function onSave(e: FormEvent) {
		e.preventDefault()

		if (name.length === 0) {
			setError("Your tag must have a name");
		}
		else {
			setError(null);
			props.onSave({ name: name, colourVariant: colourVariant || undefined });
		}
	}

	return (
		<JForm className="tag-form" onSubmit={onSave}>
			<div className="tag-form__back">
				<JArrowButton
					onClick={() => {
						props.navigate({screen: "list"})
					}}
					direction="left"
				>All Tags</JArrowButton>
			</div>
			<div className="tag-form__header">
				<h2>{props.title}</h2>
				{error && <JErrorText>{error}</JErrorText>}
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
						placeholder="a note title..."
					/>
				</JFormRow>
				<JFormRow>
					<JSelect
						id="variant"
						label="Colour"
						options={tagVariantOptions}
						value={colourVariant}
						onChange={(e) => {setColourVariant(e.target.value as ColourVariants|"")}}
					/>
				</JFormRow>
				<JFormRow className="preview-field">
					<JLabel>Preview</JLabel>
					<JPill
						variant={colourVariant as ColourVariants || undefined}
					>{name || "Preview"}</JPill>
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
