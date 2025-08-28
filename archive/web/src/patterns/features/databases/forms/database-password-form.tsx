import { useCallback } from "react";
import {
	JInput,
	JErrorText,
	JButtonGroup, JButton,
	JForm, JFormContent, JFormRow,
} from "@ben-ryder/jigsaw-react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";

export interface DatabasePasswordFormProps {
	saveText?: string
	onSave: (password: string) => void;
	cancelText?: string
	onCancel: () => void;
}

export const DatabasePasswordSchema = z.object({
	password: z.string().min(10, {message: 'Must be at least 10 chars'}),
	confirmPassword: z.string()
})
	.refine(data => {return data.password === data.confirmPassword}, {
		message: "Must match password",
		path: ['confirmPassword']
	})
export type DatabasePasswordSchema = z.infer<typeof DatabasePasswordSchema>

export function DatabasePasswordForm(props: DatabasePasswordFormProps) {
	const {
		handleSubmit,
		control,
		formState: {errors}
	} = useForm<DatabasePasswordSchema>({
		resolver: zodResolver(DatabasePasswordSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
		}
	})

	const onSubmit = useCallback((data: DatabasePasswordSchema) => {
		props.onSave(data.password)
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
						name='password'
						control={control}
						render={({ field: { ...rest } }) => (
							<JInput
								label="Password"
								id="name"
								type="password"
								placeholder="your password..."
								error={errors.password?.message}
								required={true}
								{...rest}
							/>
						)}
					/>
				</JFormRow>
				<JFormRow>
					<Controller
						name='confirmPassword'
						control={control}
						render={({ field: { ...rest } }) => (
							<JInput
								label="Confirm Password"
								id="confirm-password"
								type="password"
								placeholder="confirm your password..."
								error={errors.confirmPassword?.message}
								required={true}
								{...rest}
							/>
						)}
					/>
				</JFormRow>
			</JFormContent>

			<JFormRow>
				<JButtonGroup separateEnd={true}>
					<JButton
						type="button"
						variant='secondary'
						onClick={props.onCancel}
					>{props.cancelText || 'Cancel'}</JButton>
					<JButton type="submit">{props.saveText || 'Save'}</JButton>
				</JButtonGroup>
			</JFormRow>
		</JForm>
	);
}
