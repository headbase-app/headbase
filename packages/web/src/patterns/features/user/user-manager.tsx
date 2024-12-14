import {LoginForm} from "./login-form";
import {JButton, JProse} from "@ben-ryder/jigsaw-react";
import {useHeadbase} from "../../../logic/react/use-headbase.tsx";
import {useCurrentUser} from "../../../logic/react/use-current-user.tsx";
import {LiveQueryStatus} from "../../../logic/control-flow.ts";
import {ErrorCallout} from "../../components/error-callout/error-callout.tsx";

export function UserManager() {
	const { headbase } = useHeadbase();
	const userQuery = useCurrentUser()

	if (userQuery.status === LiveQueryStatus.LOADING) {
		return (
			<p>Loading...</p>
		)
	}
	if (userQuery.status === LiveQueryStatus.ERROR) {
		return (
			<ErrorCallout errors={userQuery.errors} />
		)
	}

	if (!userQuery.result) {
		return (
			<LoginForm
				onSubmit={async (loginDetails) => {
					if (!headbase) throw new Error("Headbase not found")
					await headbase.server.login(loginDetails)
				}}
			/>
		)
	}

	return (
		<div>
			<JProse>
				<p>Hello <b>{userQuery.result.displayName}</b>!</p>
				<p>You are logged in with <b>{userQuery.result.email}</b> to server <b>{userQuery.result.serverUrl}</b></p>
			</JProse>
			<JButton
				// todo: logout isn't clearing local data correctly?
				onClick={async () => {
					if (!headbase) throw new Error("Headbase not found")
					await headbase.server.logout()
				}}
				variant="secondary"
			>Log out</JButton>
		</div>
	)
}
