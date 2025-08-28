import React from "react";
import {JDialog} from "@ben-ryder/jigsaw-react";
import {SettingsManager} from "./settings-manager.tsx";
import {createModalContext} from "../common/dialog/generic-dialog.tsx";

export const {
	context: SettingsDialogContext,
	useContext: useSettingsDialog,
	provider: SettingsDialogProvider
} = createModalContext()

export function SettingsDialog() {
	const {isOpen, setIsOpen} = useSettingsDialog()

	return (
		<JDialog
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			title="Settings"
			description="Manage your account, app settings etc."
			style={{
				width: "100%",
				maxWidth: "1000px",
				height: "100%"
			}}
			content={
				<SettingsManager />
			}
		/>
	)
}
