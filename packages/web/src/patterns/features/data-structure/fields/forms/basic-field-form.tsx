import {
	JInput, JButtonGroup, JButton, JForm, JFormContent, JFormRow, JErrorText, JTextArea
} from "@ben-ryder/jigsaw-react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {GenericFormProps} from "../../../common/generic-form/generic-form.tsx";
import {
	BooleanFieldData,
	ColourFieldData, DateFieldData,
	EmailFieldData,
	NumberFieldData, PhoneFieldData,
	TextLongFieldData,
	TextShortFieldData, TimestampFieldData, URLFieldData
} from "../../../../../logic/schemas/fields/types/basic.ts";

export const BasicFieldsDataTypes = ['textShort', 'textLong', 'url', 'number', 'boolean', 'date', 'timestamp'] as const
export type BasicFieldsDataTypes = keyof typeof BasicFieldsDataTypes

export const BasicFieldsData = z.union([
	TextShortFieldData,
	TextLongFieldData,
	URLFieldData,
	EmailFieldData,
	ColourFieldData,
	PhoneFieldData,
	BooleanFieldData,
	NumberFieldData,
	DateFieldData,
	TimestampFieldData,
])
export type BasicFieldsData = z.infer<typeof BasicFieldsData>

export function BasicFieldForm(props: GenericFormProps<BasicFieldsData>) {

	function onSave(data: BasicFieldsData) {
		props.onSave(data)
	}

	const {handleSubmit, control, register, formState: {errors}, setValue } = useForm<BasicFieldsData>({
		resolver: zodResolver(BasicFieldsData),
		defaultValues: {
			type: props.data.type,
			name: props.data.name || "",
			description: props.data.description || "",
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
								label="Name"
								id="Name"
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
								value={field.value ?? ''}
								label="Tooltip"
								id="description"
								placeholder="a breif description of your field..."
								error={errors.description?.message}
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
