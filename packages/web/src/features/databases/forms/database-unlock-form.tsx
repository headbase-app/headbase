import { useCallback } from "react";
import { JButton, JButtonGroup, JErrorText, JForm, JFormContent, JFormRow, JInput } from "@ben-ryder/jigsaw-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useHeadbase } from "@headbase-toolkit/react/use-headbase";
import { ErrorTypes, HeadbaseError } from "@headbase-toolkit/control-flow";


const UnlockFormSchema = z.object({
	password: z.string().min(1, "Please enter your password ")
})
type UnlockFormSchema = z.infer<typeof UnlockFormSchema>

export interface DatabaseUnlockFormProps {
	databaseId: string
	onSuccess: () => void;
}

export function DatabaseUnlockForm(props: DatabaseUnlockFormProps) {
	const {
		handleSubmit,
		control,
		formState: {errors},
		setError
	} = useForm<UnlockFormSchema>({
		resolver: zodResolver(UnlockFormSchema),
		defaultValues: {
			password: '',
		}
	})

	const { headbase, setCurrentDatabaseId } = useHeadbase()

	const onSubmit = useCallback(async (data: UnlockFormSchema) => {
		try {
			await headbase.databases.unlock(props.databaseId, data.password)

			// todo: may not work as doesn't clean up open hooks etc?
			setCurrentDatabaseId(props.databaseId)
			props.onSuccess()
		}
		catch (e) {
			console.error(e)

			if (e instanceof HeadbaseError && e.cause.type === ErrorTypes.INVALID_PASSWORD_OR_KEY) {
				return setError('password', { message: 'The password you entered is incorrect.' })
			}
			return setError('root', { message: 'An unexpected error occurred.' })
		}
	}, [headbase])

	return (
		<JForm className="database-form" onSubmit={handleSubmit(onSubmit)} noValidate>
			<JFormContent>
				<JFormRow>
					<Controller
						name='password'
						control={control}
						render={({field: {...rest}}) => (
							<JInput
								label="Password"
								id="password"
								type="password"
								placeholder="your unlock password..."
								error={errors.password?.message}
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
					<JButton type="submit">{'Unlock and Open'}</JButton>
				</JButtonGroup>
			</JFormRow>
		</JForm>
	);
}
