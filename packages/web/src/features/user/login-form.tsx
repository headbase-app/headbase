import {
	JButton,
	JButtonGroup,
	JCallout,
	JContentSection,
	JForm,
	JFormContent,
	JFormHeader,
	JFormRow, JInput, JProse,
} from "@ben-ryder/jigsaw-react";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {LocalLoginRequest} from "@headbase-toolkit/headbase-web";
import {ErrorIdentifiers} from "@headbase-app/common";

export default {
	title: "Layouts/Form",
	parameters: {
		status: {
			type: "experimental",
		},
	},
};

export interface LoginFormProps {
	onSubmit: (data: LocalLoginRequest) => Promise<void>
}


export function LoginForm(props: LoginFormProps) {
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		setError,
		clearErrors,
	} = useForm<LocalLoginRequest>({
		resolver: zodResolver(LocalLoginRequest),
		mode: "onTouched",
		defaultValues: {
			email: "",
			password: "",
			serverUrl: ""
		},
	});
	const onSubmit = async (data: LocalLoginRequest) => {
		clearErrors();

		try {
			await props.onSubmit(data)
		}
		catch (e) {
			// @ts-expect-error -- todo: improve error handling setup here
			if (e?.cause?.originalError?.identifier === ErrorIdentifiers.AUTH_CREDENTIALS_INVALID) {
				setError('root', {message: "Your email/password combination was incorrect."})
			}
			else {
				setError('root', {message: "Could not communicate with server, please check your server URL is correct or try again later."})
			}
		}
	};

	return (
		<JContentSection>
			<JForm className="j-form" onSubmit={handleSubmit(onSubmit)}>
				<JFormHeader className="j-form__header">
					<h2>Login</h2>
					<p>
						Enter the URL of your server and then log in to your account.
					</p>
				</JFormHeader>
				<JFormContent>
					<JFormRow>
						{errors.root && (
							<JCallout variant="critical">{errors.root.message}</JCallout>
						)}
					</JFormRow>
					<JFormRow>
						<Controller
							name="serverUrl"
							control={control}
							render={({ field }) => (
								<JInput
									type="url"
									label="Server URL"
									placeholder="https://server.headbase.app"
									required={true}
									{...field}
									error={errors.serverUrl?.message as string}
									tooltip={{
										content: (
											<p>The URL of a self-hosted <a href="https://github.com/headbase/headbase" target="_blank" rel="noreferrer">Headbase server.</a></p>
										)
									}}
								/>
							)}
						/>
					</JFormRow>
					<JProse>
						<hr />
					</JProse>
					<JFormRow>
						<Controller
							name="email"
							control={control}
							render={({ field }) => (
								<JInput
									type="email"
									label="Email"
									placeholder="hello@example.com"
									required={true}
									{...field}
									error={errors.email?.message as string}
								/>
							)}
						/>
					</JFormRow>
					<JFormRow>
						<Controller
							name="password"
							control={control}
							render={({ field }) => (
								<JInput
									type="password"
									label="Password"
									placeholder="your password here..."
									required={true}
									{...field}
									error={errors.password?.message as string}
								/>
							)}
						/>
					</JFormRow>
					<JFormRow>
						<JButtonGroup>
							<JButton type="submit" disabled={isSubmitting}>Log In</JButton>
						</JButtonGroup>
					</JFormRow>
				</JFormContent>
			</JForm>
		</JContentSection>
	);
}
