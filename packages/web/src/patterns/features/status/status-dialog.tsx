import React from "react";
import {JButton, JDialog} from "@ben-ryder/jigsaw-react";
import {createModalContext} from "../common/dialog/generic-dialog.tsx";
import {useHeadbase} from "../../../headbase/hooks/use-headbase.tsx";

export const {
	context: StatusDialogContext,
	useContext: useStatusDialog,
	provider: StatusDialogProvider
} = createModalContext()

export function StatusDialog() {
	const {isOpen, setIsOpen} = useStatusDialog()
	const { headbase, currentDatabaseId } = useHeadbase()

	async function onRequestSync() {
		if (!headbase || !currentDatabaseId) return
		headbase.sync.requestSync(currentDatabaseId)
	}

	return (
		<JDialog
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			title="Application Status"
			description="View the application status"
			content={
				<>
					<JButton onClick={onRequestSync}>Request sync</JButton>
					<p>Status info here</p>
				</>
			}
		/>
	)
}
