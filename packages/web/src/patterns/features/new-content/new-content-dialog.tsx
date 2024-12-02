import React from "react";
import {JDialog} from "@ben-ryder/jigsaw-react";
import {NewContentMenu} from "./new-content-menu/new-content-menu";
import {createModalContext} from "../common/dialog/generic-dialog.tsx";

export const {
	context: NewContentDialogContext,
	useContext: useNewContentDialog,
	provider: NewContentDialogProvider,
} = createModalContext()

export function NewContentDialog() {
	const {isOpen, setIsOpen} = useNewContentDialog()

	return (
		<JDialog
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			title="Create new content"
			description="Add new content"
			content={
				<NewContentMenu onOpen={() => {
					setIsOpen(false)
				}} />
			}
		/>
	)
}
