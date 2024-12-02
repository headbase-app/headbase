import React from "react";
import {JDialog} from "@ben-ryder/jigsaw-react";
import {AccountManager} from "./account-manager";
import {createModalContext} from "../common/dialog/generic-dialog.tsx";

export const {
	context: AccountDialogContext,
	useContext: useAccountDialog,
	provider: AccountDialogProvider
} = createModalContext()

export function AccountDialog() {
	const {isOpen, setIsOpen} = useAccountDialog()

	return (
		<JDialog
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			title="Account"
			description="Manage your account, including local settings and server account."
			style={{
				width: "100%",
				maxWidth: "1000px",
				height: "100%"
			}}
			content={
				<AccountManager />
			}
		/>
	)
}
