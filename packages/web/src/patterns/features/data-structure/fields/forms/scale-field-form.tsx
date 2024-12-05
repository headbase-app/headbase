import {
	JInput, JButtonGroup, JButton, JForm, JFormContent, JFormRow, JErrorText, JTextArea, JProse
} from "@ben-ryder/jigsaw-react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {GenericFormProps} from "../../../common/generic-form/generic-form.tsx";
import {ScaleFieldData} from "../../../../../logic/schemas/fields/types/special.ts";


export function ScaleFieldForm(props: GenericFormProps<ScaleFieldData>) {

	function onSave(data: ScaleFieldData) {
		props.onSave(data)
	}

	const {handleSubmit, control, register, formState: {errors}, setValue, setError } = useForm<ScaleFieldData>({
		resolver: zodResolver(ScaleFieldData),
		defaultValues: {
			type: 'scale',
			name: props.data.name || "",
			description: props.data.description || "",
			settings: props.data.settings
		}
	})

	return (
		<JForm className="content-form" onSubmit={handleSubmit(onSave)} noValidate>
			<input {...register('type')} readOnly={true} style={{display: 'none'}} />

			<JFormContent>
				<JFormRow>
					<Controller
						control={control}
						name='name'
						render={({field}) => (
							<JInput
								{...field}
								label="Label"
								id="name"
								type="text"
								placeholder="a field label..."
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
						name='settings.scale'
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
										setError('settings.scale', {message: 'scale must be an integer'})
									}
								}}
								onBlur={field.onBlur}
								label="Scale"
								id="scale"
								type="number"
								// todo: add native min/max attributes?
								placeholder="number of lines to display the field at..."
								error={errors.settings?.scale?.message}
							/>
						)}
					/>
				</JFormRow>
				<JFormRow>
					<Controller
						control={control}
						name='settings.minLabel'
						render={({field}) => (
							<JInput
								{...field}
								label="Min Label"
								id="min-label"
								type="text"
								placeholder="the label to display at the minimum of the scale..."
								error={errors.settings?.minLabel?.message}
								required={true}
							/>
						)}
					/>
				</JFormRow>
				<JFormRow>
					<Controller
						control={control}
						name='settings.maxLabel'
						render={({field}) => (
							<JInput
								{...field}
								label="Max Label"
								id="max-label"
								type="text"
								placeholder="the label to display at the maximum of the scale..."
								error={errors.settings?.maxLabel?.message}
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
