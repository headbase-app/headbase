import {LoginForm} from "./login-form";
import {JButton, JProse} from "@ben-ryder/jigsaw-react";
import {useLocalful} from "@localful-headbase/react/use-localful";


export function UserManager() {
	const { isUserLoading, currentUser, isServerUrlLoading, serverUrl, login, logout } = useLocalful()

	if (isUserLoading || isServerUrlLoading) {
		return (
			<p>Loading...</p>
		)
	}

	console.debug(currentUser)
	console.debug(serverUrl)

	if (!currentUser || !serverUrl) {
		return (
			<LoginForm
				onSubmit={login}
			/>
		)
	}

	return (
		<div>
			<JProse>
				<p>Logged in as <b>{currentUser.email} ({currentUser.displayName})</b> to server <b>{serverUrl}</b></p>
			</JProse>
			<JButton
				// todo: logout isn't clearing local data correctly.
				onClick={logout}
				variant="secondary"
			>Log out</JButton>
		</div>
	)
}
