import React from "react";
import { JDialog } from "@ben-ryder/jigsaw-react";
import {createModalContext} from "../../../common/dialog/generic-dialog";

import {ContentList} from "../../content-list/content-list";

export const {
	context: SearchDialogContext,
	useContext: useSearchDialog,
	provider: SearchDialogProvider
} = createModalContext()

export function SearchDialog() {
	const {isOpen, setIsOpen} = useSearchDialog()

	return (
		<JDialog
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			title="Search"
			description="Search for your content, view favorites and actions"
			content={
				<ContentList onOpen={() => {
					setIsOpen(false)
				}}/>
			}
		/>
	)
}
