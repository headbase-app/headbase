import React from "react";
import { JDialog } from "@ben-ryder/jigsaw-react";
import { DataStructureManager } from "./data-structure-manager";
import {createModalContext} from "../common/dialog/generic-dialog.tsx";

export const {
	context: DataStructureDialogContext,
	useContext: useDataStructureDialog,
	provider: DataStructureDialogProvider
} = createModalContext()

export function DataStructureDialog() {
	const {isOpen, setIsOpen} = useDataStructureDialog()

	return (
		<JDialog
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			style={{
				width: "100%",
				maxWidth: "1000px",
				height: "100%"
			}}
			title="Data Structure"
			description="Manage fields, content types and tags"
			content={
				<DataStructureManager />
			}
		/>
	)
}
