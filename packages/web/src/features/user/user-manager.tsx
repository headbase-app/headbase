import {LoginForm} from "./login-form";
import {JButton, JProse} from "@ben-ryder/jigsaw-react";
import {useLocalful} from "@headbase-toolkit/react/use-localful";


export function UserManager() {
	const { isUserLoading, currentUser, login, logout } = useLocalful()

	if (isUserLoading) {
		return (
			<p>Loading...</p>
		)
	}
	if (!currentUser) {
		return (
			<LoginForm
				onSubmit={login}
			/>
		)
	}

	return (
		<div>
			<JProse>
				<p>Logged in as <b>{currentUser.email} ({currentUser.displayName})</b> to server <b>{currentUser.serverUrl}</b></p>
			</JProse>
			<JButton
				// todo: logout isn't clearing local data correctly.
				onClick={logout}
				variant="secondary"
			>Log out</JButton>
		</div>
	)
}
