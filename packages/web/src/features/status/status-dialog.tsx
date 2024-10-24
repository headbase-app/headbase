import React from "react";
import {JDialog} from "@ben-ryder/jigsaw-react";
import {createModalContext} from "../../common/dialog/generic-dialog";

export const {
	context: StatusDialogContext,
	useContext: useStatusDialog,
	provider: StatusDialogProvider
} = createModalContext()

export function StatusDialog() {
	const {isOpen, setIsOpen} = useStatusDialog()

	return (
		<JDialog
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			title="Application Status"
			description="View the application status"
			content={
				<p>Status info here</p>
			}
		/>
	)
}
