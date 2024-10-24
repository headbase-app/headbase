import { useCallback } from "react";
import { JButton, JButtonGroup, JErrorText, JForm, JFormContent, JFormRow, JInput } from "@ben-ryder/jigsaw-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocalful } from "@headbase-toolkit/react/use-localful";
import { ErrorTypes, LocalfulError } from "@headbase-toolkit/control-flow";


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

	const { openDatabase, unlockDatabase } = useLocalful()

	const onSubmit = useCallback(async (data: UnlockFormSchema) => {
		try {
			await unlockDatabase(props.databaseId, data.password)

			// todo: could unlock and open be the same operations. there is a disconnect at the moment?
			await openDatabase(props.databaseId)
			props.onSuccess()
		}
		catch (e) {
			console.error(e)

			if (e instanceof LocalfulError && e.cause.type === ErrorTypes.INVALID_PASSWORD_OR_KEY) {
				return setError('password', { message: 'The password you entered is incorrect.' })
			}
			return setError('root', { message: 'An unexpected error occurred.' })
		}
	}, [unlockDatabase])

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
