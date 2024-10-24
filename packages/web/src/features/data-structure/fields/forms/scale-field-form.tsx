import {
	JInput, JButtonGroup, JButton, JForm, JFormContent, JFormRow, JErrorText, JTextArea, JProse
} from "@ben-ryder/jigsaw-react";
import {GenericFormProps} from "../../../../common/generic-form/generic-form";
import { FieldScale } from "../../../../state/schemas/fields/fields";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

export interface ScaleFieldFormProps extends Omit<GenericFormProps<FieldScale>, 'title'> {}

export function ScaleFieldForm(props: ScaleFieldFormProps) {

	function onSave(data: FieldScale) {
		props.onSave(data)
	}

	const {handleSubmit, control, register, formState: {errors}, setValue, setError } = useForm<FieldScale>({
		resolver: zodResolver(FieldScale),
		defaultValues: {
			type: 'scale',
			label: props.data.label || "",
			description: props.data.description || "",
			required: props.data.required || false,
			scale: props.data.scale || 5,
			minLabel: props.data.minLabel || "",
			maxLabel: props.data.maxLabel || "",
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
						name='scale'
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
										setError('scale', {message: 'scale must be an integer'})
									}
								}}
								onBlur={field.onBlur}
								label="Scale"
								id="scale"
								type="number"
								// todo: add native min/max attributes?
								placeholder="number of lines to display the field at..."
								error={errors.scale?.message}
							/>
						)}
					/>
				</JFormRow>
				<JFormRow>
					<Controller
						control={control}
						name='minLabel'
						render={({field}) => (
							<JInput
								{...field}
								label="Min Label"
								id="min-label"
								type="text"
								placeholder="the label to display at the minimum of the scale..."
								error={errors.minLabel?.message}
								required={true}
							/>
						)}
					/>
				</JFormRow>
				<JFormRow>
					<Controller
						control={control}
						name='maxLabel'
						render={({field}) => (
							<JInput
								{...field}
								label="Max Label"
								id="max-label"
								type="text"
								placeholder="the label to display at the maximum of the scale..."
								error={errors.maxLabel?.message}
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
