import React from "react";
import {JButton, JDialog} from "@ben-ryder/jigsaw-react";
import {createModalContext} from "../../../common/dialog/generic-dialog";

import "./content-list-dialog.scss"
import {useWorkspaceContext} from "../../workspace/workspace-context";
import {ContentList} from "../content-list";
import {useNewContentDialog} from "../../new-content/new-content-dialog";

export const {
	context: ContentListDialogContext,
	useContext: useContentListDialog,
	provider: ContentListDialogProvider
} = createModalContext()

export function ContentListDialog() {
	const {isOpen, setIsOpen} = useContentListDialog()
	const { setIsOpen: setIsNewContentDialogOpen} = useNewContentDialog()
	const { openTab } = useWorkspaceContext()

	return (
		<JDialog
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			title="All Content"
			description="View all your content"
			content={
				<div className='content-list-dialog'>
					<div className='content-list-dialog__header'>
						<JButton
							className='content-list-dialog__tab-open'
							onClick={() => {
								openTab({type: 'content_list'}, {switch: true})
								setIsOpen(false)
							}}
							variant='tertiary'
						>Open content list tab
						</JButton>
						<JButton
							className='content-list-dialog__create'
							onClick={() => {
								setIsOpen(false)
								setIsNewContentDialogOpen(true)
							}}
						>New Content
						</JButton>
					</div>
					<div className='content-list-dialog__content'>
						<ContentList onOpen={() => {
							setIsOpen(false)
						}}/>
					</div>
				</div>
			}
		/>
	)
}
