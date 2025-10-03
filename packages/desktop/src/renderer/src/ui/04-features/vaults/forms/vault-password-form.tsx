import { useCallback } from "react";
import {Controller, useForm} from "react-hook-form";
import {Button} from "@ui/01-atoms/button/button";
import {Input} from "@ui/01-atoms/input/input";

export interface DatabasePasswordFormProps {
	saveText?: string
	onSave: (password: string) => void;
	cancelText?: string
	onCancel: () => void;
}

// export const DatabasePasswordSchema = z.object({
// 	password: z.string().min(10, {message: 'Must be at least 10 chars'}),
// 	confirmPassword: z.string()
// })
// 	.refine(data => {return data.password === data.confirmPassword}, {
// 		message: "Must match password",
// 		path: ['confirmPassword']
// 	})
// export type DatabasePasswordSchema = z.infer<typeof DatabasePasswordSchema>

export function VaultPasswordForm({saveText, cancelText, onSave, onCancel}: DatabasePasswordFormProps) {
	const {
		handleSubmit,
		control,
		formState: {errors}
	} = useForm({
		//resolver: zodResolver(DatabasePasswordSchema),
		defaultValues: {
			password: '',
			confirmPassword: '',
		}
	})

	const onSubmit = useCallback((data) => {
		onSave(data.password)
	}, [onSave])

	return (
		<form className="database-form" onSubmit={handleSubmit(onSubmit)} noValidate>
			<div className="database-form__header">
				{errors.root?.message && (
					<p>{errors.root.message}</p>
				)}
			</div>
			<div>
				<div>
					<Controller
						name='password'
						control={control}
						render={({ field: { ...rest } }) => (
							<Input
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
				</div>
				<div>
					<Controller
						name='confirmPassword'
						control={control}
						render={({ field: { ...rest } }) => (
							<Input
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
				</div>
			</div>

			<div>
				<div className='flex items-center gap-4'>
					<Button
						type="button"
						variant='secondary'
						onClick={onCancel}
					>{cancelText || 'Cancel'}</Button>
					<Button type="submit">{saveText || 'Save'}</Button>
				</div>
			</div>
		</form>
	);
}
