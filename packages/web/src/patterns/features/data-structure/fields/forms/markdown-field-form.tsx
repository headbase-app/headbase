import {
	JInput, JButtonGroup, JButton, JForm, JFormContent, JFormRow, JErrorText, JTextArea
} from "@ben-ryder/jigsaw-react";
import {GenericFormProps} from "../../../../common/generic-form/generic-form";
import {FieldMarkdown} from "@headbase-toolkit/schemas/entities/fields/fields";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

export interface MarkdownFieldFormProps extends Omit<GenericFormProps<FieldMarkdown>, 'title'> {}

export function MarkdownFieldForm(props: MarkdownFieldFormProps) {

	function onSave(data: FieldMarkdown) {
		props.onSave(data)
	}

	const {handleSubmit, control, register, formState: {errors}, setValue, setError } = useForm<FieldMarkdown>({
		resolver: zodResolver(FieldMarkdown),
		defaultValues: {
			type: 'markdown',
			label: props.data.label || "",
			description: props.data.description || "",
			required: props.data.required || false,
			lines: props.data.lines || 3,
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
				<JFormRow>
					<Controller
						control={control}
						name='lines'
						render={({field}) => (
							<JInput
								name={field.name}
								ref={field.ref}
								disabled={field.disabled}
								value={field.value}
								onChange={(e) => {
									try {
										const newValue = parseInt(e.target.value)
										field.onChange(newValue)
									}
									catch (e) {
										setError('lines', {message: 'Lines must be an integer'})
									}
								}}
								onBlur={field.onBlur}
								label="Lines"
								id="lins"
								type="number"
								// todo: add native min/max attributes?
								placeholder="number of lines to display the field at..."
								error={errors.lines?.message}
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
