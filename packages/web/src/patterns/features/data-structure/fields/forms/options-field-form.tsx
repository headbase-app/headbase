import {
	JInput, JButtonGroup, JButton, JForm, JFormContent, JFormRow, JErrorText, JTextArea, JProse
} from "@ben-ryder/jigsaw-react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {SelectFieldData} from "../../../../../logic/schemas/fields/types/select.ts";
import {GenericFormProps} from "../../../common/generic-form/generic-form.tsx";
import {z} from "zod";

export const SelectFormFields = SelectFieldData.pick({
	name: true,
	description: true,
	icon: true
}).extend({
	settingsText: z.string()
})
export type SelectFormFields = z.infer<typeof SelectFormFields>


export function OptionsFieldForm(props: GenericFormProps<SelectFieldData>) {

	function onSave(data: SelectFormFields) {
		const lines = data.settingsText.split("\n")
		const options = lines.map(line => {
			const [label, value] = line.split(":")
			return {label, value}
		})

		props.onSave({
			type: 'selectOne',
			...data,
			settings: {
				options
			}
		})
	}

	const {
		handleSubmit,
		control,
		formState: {errors}
	} = useForm<SelectFormFields>({
		resolver: zodResolver(SelectFormFields),
		defaultValues: {
			name: props.data.name || "",
			description: props.data.description || null,
			icon: props.data.icon || null,
			settingsText: props.data.settings
				? props.data.settings.options.map(option => {return `${option.label}:${option.value}`}).join("\n")
				: ''
		}
	})

	return (
		<JForm className="content-form" onSubmit={handleSubmit(onSave)} noValidate>
			<JFormContent>
				<JFormRow>
					<Controller
						control={control}
						name='name'
						render={({field}) => (
							<JInput
								{...field}
								label="Name"
								id="name"
								type="text"
								placeholder="a field name..."
								error={errors.name?.message}
								required={true}
							/>
						)}
					/>
				</JFormRow>
				<JFormRow>
					<Controller
						control={control}
						name='description'
						render={({field}) => (
							<JTextArea
								{...field}
								value={field.value ?? ""}
								label="Tooltip"
								id="description"
								placeholder="a breif description of your field..."
								error={errors.description?.message}
							/>
						)}
					/>
				</JFormRow>
				{/** todo: make dedicated Jigsaw component to use hr tag outside of prose? **/}
				<JProse>
					<hr />
				</JProse>
				<JFormRow>
					<Controller
						control={control}
						name='settingsText'
						render={({field}) => (
							<JTextArea
								{...field}
								label="Options"
								id="options"
								placeholder="the options you can pick from, each entered on a new line.."
								error={errors.settingsText?.message}
								rows={8}
								required={true}
							/>
						)}
					/>
					<JProse>
						<p>Type one value per line in the format <code>label:value</code>.</p>
					</JProse>
				</JFormRow>
			</JFormContent>

			<JFormRow>
				{errors.root && (
					<JErrorText>{errors.root.message}</JErrorText>
				)}
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
