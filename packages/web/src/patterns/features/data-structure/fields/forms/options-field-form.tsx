import {
	JInput, JButtonGroup, JButton, JForm, JFormContent, JFormRow, JErrorText, JTextArea, JProse
} from "@ben-ryder/jigsaw-react";
import {GenericFormProps} from "../../../../common/generic-form/generic-form";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {FieldOptions} from "@headbase-toolkit/schemas/entities/fields/fields";

export interface OptionsFieldFormProps extends Omit<GenericFormProps<FieldOptions>, 'title'> {}

export function OptionsFieldForm(props: OptionsFieldFormProps) {

	function onSave(data: FieldOptions) {
		props.onSave(data)
	}

	const {handleSubmit, control, register, formState: {errors}, setValue } = useForm<FieldOptions>({
		resolver: zodResolver(FieldOptions),
		defaultValues: {
			type: props.data.type,
			label: props.data.label || "",
			description: props.data.description || "",
			required: props.data.required || false,
			options: props.data.options || []
		}
	})

	return (
		<JForm className="content-form" onSubmit={handleSubmit(onSave)} noValidate>
			<input {...register('type')} readOnly={true} style={{display: 'none'}} />

			<JFormContent>
				<JFormRow>
					<Controller
						control={control}
						name='label'
						render={({field}) => (
							<JInput
								{...field}
								label="Label"
								id="label"
								type="text"
								placeholder="a field label..."
								error={errors.label?.message}
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
								label="Tooltip"
								id="description"
								placeholder="a breif description of your field..."
								error={errors.description?.message}
							/>
						)}
					/>
				</JFormRow>
				<JFormRow>
					<Controller
						control={control}
						name='required'
						render={({field}) => (
							<JInput
								ref={field.ref}
								name={field.name}
								checked={field.value}
								onChange={() => {
									setValue('required', !field.value)
								}}
								onBlur={field.onBlur}
								disabled={field.disabled}
								label="Is Required?"
								id="required"
								type="checkbox"
								placeholder="You should be required to fill in this field"
								error={errors.required?.message}
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
						name='options'
						render={({field}) => (
							<JTextArea
								value={field.value.join("\n")}
								onChange={e => {
									const value = e.target.value.split("\n")
									field.onChange(value)
								}}
								ref={field.ref}
								onBlur={field.onBlur}
								name={field.name}
								disabled={field.disabled}
								label="Options"
								id="options"
								placeholder="the options you can pick from, each entered on a new line.."
								error={errors.options?.message}
								tooltip={{
									content: <p>Enter each option on a new line</p>
								}}
								rows={8}
								required={true}
							/>
						)}
					/>
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
