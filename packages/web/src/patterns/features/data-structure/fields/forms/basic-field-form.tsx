import {
	JInput, JButtonGroup, JButton, JForm, JFormContent, JFormRow, JErrorText, JTextArea
} from "@ben-ryder/jigsaw-react";
import {GenericFormProps} from "../../../../common/generic-form/generic-form";
import {
	FieldBoolean, FieldDate,
	FieldLongText,
	FieldNumber,
	FieldShortText, FieldTimestamp,
	FieldURL
} from "@headbase-toolkit/schemas/entities/fields/fields";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";

export const BasicFieldsDataTypes = ['textShort', 'textLong', 'url', 'number', 'boolean', 'date', 'timestamp'] as const
export type BasicFieldsDataTypes = keyof typeof BasicFieldsDataTypes

export const BasicFieldsData = z.union([FieldShortText, FieldLongText, FieldURL, FieldNumber, FieldBoolean, FieldDate, FieldTimestamp])
export type BasicFieldsData = z.infer<typeof BasicFieldsData>

export interface BasicFieldFormProps extends Omit<GenericFormProps<BasicFieldsData>, 'title'> {}

export function BasicFieldForm(props: BasicFieldFormProps) {

	function onSave(data: BasicFieldsData) {
		props.onSave(data)
	}

	const {handleSubmit, control, register, formState: {errors}, setValue } = useForm<BasicFieldsData>({
		resolver: zodResolver(BasicFieldsData),
		defaultValues: {
			type: props.data.type,
			label: props.data.label || "",
			description: props.data.description || "",
			required: props.data.required || false,
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
