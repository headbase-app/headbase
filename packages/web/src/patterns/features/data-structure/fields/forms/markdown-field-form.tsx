import {
	JInput, JButtonGroup, JButton, JForm, JFormContent, JFormRow, JErrorText, JTextArea
} from "@ben-ryder/jigsaw-react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {GenericFormProps} from "../../../common/generic-form/generic-form.tsx";
import {MarkdownFieldData} from "../../../../../logic/schemas/fields/types/basic.ts";


export function MarkdownFieldForm(props: GenericFormProps<MarkdownFieldData>) {

	function onSave(data: MarkdownFieldData) {
		props.onSave(data)
	}

	const {handleSubmit, control, register, formState: {errors}, setValue, setError } = useForm<MarkdownFieldData>({
		resolver: zodResolver(MarkdownFieldData),
		defaultValues: {
			type: 'markdown',
			name: props.data.name || "",
			description: props.data.description || null,
			icon: props.data.icon || null,
			settings: props.data.settings || {defaultLines: 5}
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
				{/*<JFormRow>*/}
				{/*	<Controller*/}
				{/*		control={control}*/}
				{/*		name='lines'*/}
				{/*		render={({field}) => (*/}
				{/*			<JInput*/}
				{/*				name={field.name}*/}
				{/*				ref={field.ref}*/}
				{/*				disabled={field.disabled}*/}
				{/*				value={field.value}*/}
				{/*				onChange={(e) => {*/}
				{/*					try {*/}
				{/*						const newValue = parseInt(e.target.value)*/}
				{/*						field.onChange(newValue)*/}
				{/*					}*/}
				{/*					catch (e) {*/}
				{/*						setError('lines', {message: 'Lines must be an integer'})*/}
				{/*					}*/}
				{/*				}}*/}
				{/*				onBlur={field.onBlur}*/}
				{/*				label="Lines"*/}
				{/*				id="lins"*/}
				{/*				type="number"*/}
				{/*				// todo: add native min/max attributes?*/}
				{/*				placeholder="number of lines to display the field at..."*/}
				{/*				error={errors.lines?.message}*/}
				{/*			/>*/}
				{/*		)}*/}
				{/*	/>*/}
				{/*</JFormRow>*/}
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
