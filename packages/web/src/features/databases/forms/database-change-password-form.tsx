import {useCallback} from "react";
import {
	JInput,
	JErrorText,
	JButtonGroup, JButton,
	JForm, JFormContent, JFormRow
} from "@ben-ryder/jigsaw-react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";


const ChangePasswordFormSchema = z.object({
	currentPassword: z.string().min(1, "Please enter your password "),
	newPassword: z.string().min(10, {message: 'Must be at least 10 chars'}),
	confirmNewPassword: z.string().min(1, "Please enter your password ")
})
	.refine(data => {return data.newPassword === data.confirmNewPassword}, {
		message: "Must match new password",
		path: ['confirmNewPassword']
	})
type ChangePasswordFormSchema = z.infer<typeof ChangePasswordFormSchema>

export interface DatabaseChangePasswordFormProps {
	databaseId: string
	onSuccess: () => void;
}

export function DatabaseChangePasswordForm(props: DatabaseChangePasswordFormProps) {
	const {
		handleSubmit,
		control,
		formState: {errors},
		setError
	} = useForm<ChangePasswordFormSchema>({
		resolver: zodResolver(ChangePasswordFormSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: '',
		}
	})

	const { headbase } = useHeadbase()

	const onSubmit = useCallback(async (data: ChangePasswordFormSchema) => {
		try {
			await headbase.databases.changePassword(props.databaseId, data.currentPassword, data.newPassword)
			props.onSuccess()
		}
		catch (e) {
			console.error(e)
			setError('currentPassword', { message: 'The current password is incorrect.' })
		}
	}, [headbase])

	return (
		<JForm className="database-form" onSubmit={handleSubmit(onSubmit)} noValidate>
			<JFormContent>
				<JFormRow>
					<Controller
						name='currentPassword'
						control={control}
						render={({field: {...rest}}) => (
							<JInput
								label="Current Password"
								id="currentPassword"
								type="password"
								placeholder="your current password..."
								error={errors.currentPassword?.message}
								required={true}
								{...rest}
							/>
						)}
					/>
				</JFormRow>
				<hr />
				<JFormRow>
					<Controller
						name='newPassword'
						control={control}
						render={({field: {...rest}}) => (
							<JInput
								label="New Password"
								id="currentPassword"
								type="password"
								placeholder="your new password..."
								error={errors.newPassword?.message}
								required={true}
								{...rest}
							/>
						)}
					/>
				</JFormRow>
				<JFormRow>
					<Controller
						name='confirmNewPassword'
						control={control}
						render={({field: {...rest}}) => (
							<JInput
								label="Confirm New Password"
								id="newPassword"
								type="password"
								placeholder="confirm your new password..."
								error={errors.confirmNewPassword?.message}
								required={true}
								{...rest}
							/>
						)}
					/>
				</JFormRow>
			</JFormContent>
			<div className="database-form__header">
				{errors.root?.message && (
					<JErrorText>{errors.root.message}</JErrorText>
				)}
			</div>
			<JFormRow>
				<JButtonGroup>
					<JButton type="submit">{'Change Password'}</JButton>
				</JButtonGroup>
			</JFormRow>
		</JForm>
	);
}
