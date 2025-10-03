import {useCallback} from "react";
import {Controller, useForm} from "react-hook-form";
import {Button} from "@ui/01-atoms/button/button";
import {useDependency} from "@framework/dependency.context";
import {Input} from "@ui/01-atoms/input/input";

// const ChangePasswordFormSchema = z.object({
// 	currentPassword: z.string().min(1, "Please enter your password "),
// 	newPassword: z.string().min(10, {message: 'Must be at least 10 chars'}),
// 	confirmNewPassword: z.string().min(1, "Please enter your password ")
// })
// 	.refine(data => {return data.newPassword === data.confirmNewPassword}, {
// 		message: "Must match new password",
// 		path: ['confirmNewPassword']
// 	})
// type ChangePasswordFormSchema = z.infer<typeof ChangePasswordFormSchema>

export interface DatabaseChangePasswordFormProps {
	databaseId: string
	onSuccess: () => void;
}

export function VaultChangePasswordForm(props: DatabaseChangePasswordFormProps) {
	const {
		handleSubmit,
		control,
		formState: {errors},
		setError
	} = useForm({
		//resolver: zodResolver(ChangePasswordFormSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: '',
		}
	})
	const { vaultsApi } = useDependency()

	const onSubmit = useCallback(async (data) => {
		try {
			//await vaultsService.changePassword(props.databaseId, data.currentPassword, data.newPassword)
			props.onSuccess()
		}
		catch (e) {
			console.error(e)
			setError('currentPassword', { message: 'The current password is incorrect.' })
		}
	}, [props, setError, vaultsApi])

	return (
		<form className="database-form" onSubmit={handleSubmit(onSubmit)} noValidate>
			<div>
				<div>
					<Controller
						name='currentPassword'
						control={control}
						render={({field: {...rest}}) => (
							<Input
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
				</div>
				<hr />
				<div>
					<Controller
						name='newPassword'
						control={control}
						render={({field: {...rest}}) => (
							<Input
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
				</div>
				<div>
					<Controller
						name='confirmNewPassword'
						control={control}
						render={({field: {...rest}}) => (
							<Input
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
				</div>
			</div>
			<div className="database-form__header">
				{errors.root?.message && (
					<p>{errors.root.message}</p>
				)}
			</div>
			<div>
				<div>
					<Button type="submit">{'Change Password'}</Button>
				</div>
			</div>
		</form>
	);
}
