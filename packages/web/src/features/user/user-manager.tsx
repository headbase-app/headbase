import {LoginForm} from "./login-form";
import {JButton, JProse} from "@ben-ryder/jigsaw-react";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {useCurrentUser} from "@headbase-toolkit/react/use-current-user";
import {LiveQueryStatus} from "@headbase-toolkit/control-flow";
import {ErrorCallout} from "../../patterns/components/error-callout/error-callout";


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
				<p>Logged in as <b>{userQuery.result.email} ({userQuery.result.displayName})</b> to server <b>{userQuery.result.serverUrl}</b></p>
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
