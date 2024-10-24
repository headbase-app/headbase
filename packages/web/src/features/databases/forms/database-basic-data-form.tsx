import {ReactNode, useCallback} from "react";
import {
	JInput,
	JErrorText,
	JButtonGroup, JButton,
	JForm, JFormContent, JFormRow, JSelect
} from "@ben-ryder/jigsaw-react";
import {LocalDatabaseFields} from "@headbase-toolkit/types/database";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

export interface DatabaseBasicDataFormProps {
	initialData?: LocalDatabaseFields
	saveText?: string
	onSave: (fields: LocalDatabaseFields) => void;
	extraButtons?: ReactNode;
}

export function DatabaseBasicDataForm(props: DatabaseBasicDataFormProps) {
	const {
		handleSubmit,
		control,
		formState: {errors}
	} = useForm<LocalDatabaseFields>({
		resolver: zodResolver(LocalDatabaseFields),
		defaultValues: {
			name: props.initialData?.name || '',
			syncEnabled: props.initialData?.syncEnabled === undefined ? 1 : props.initialData.syncEnabled,
		}
	})

	const onSubmit = useCallback((data: LocalDatabaseFields) => {
		props.onSave(data)
	}, [])

	return (
		<JForm className="database-form" onSubmit={handleSubmit(onSubmit)} noValidate>
			<div className="database-form__header">
				{errors.root?.message && (
					<JErrorText>{errors.root.message}</JErrorText>
				)}
			</div>
			<JFormContent>
				<JFormRow>
					<Controller
						name='name'
						control={control}
						render={({ field: { ...rest } }) => (
							<JInput
								label="Name"
								id="name"
								type="text"
								placeholder="your unencrypted database name..."
								error={errors.name?.message}
								tooltip={{
									content: <p>This text will be saved unencrypted so you can identify databases before unlocking them.</p>
								}}
								required={true}
								{...rest}
							/>
						)}
					/>
				</JFormRow>
				<JFormRow>
					<Controller
						name='syncEnabled'
						control={control}
						render={({ field: { value, onChange, ...rest } }) => (
							<JSelect
								label="Sync Enabled?"
								id="sync-enabled"
								value={value === 1 ? 'yes' : 'no'}
								onChange={(e) => {
									onChange(e.target.value === 'yes' ? 1 : 0);
								}}
								options={[
									{
										text: 'Yes',
										value: 'yes'
									},
									{
										text: 'No',
										value: 'no'
									}
								]}
								error={errors.syncEnabled?.message}
								required={true}
								{...rest}
							/>
						)}
					/>
				</JFormRow>
			</JFormContent>

			<JFormRow>
				<JButtonGroup>
					{props.extraButtons && props.extraButtons}
					<JButton type="submit">{props.saveText || 'Save'}</JButton>
				</JButtonGroup>
			</JFormRow>
		</JForm>
	);
}
