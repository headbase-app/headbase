
import {
	PenLine as EditIcon,
	Database as DatabaseListIcon,
	CloudDownload as StatusDownloadIcon,
	PlusSquare as NewContentIcon,
	Search as SearchIcon,
	List as AllContentIcon,
	Filter as AllViewsIcon,
	Shapes as DataStructureIcon,
	HelpCircle as HelpIcon,
	UserCircle as AccountIcon,
	ChevronFirst as CollapseMenuIcon
} from "lucide-react"
import {MainPanelAction} from "./main-panel-action";

import './menu-panel.scss'
import { JIcon, JTooltip } from "@ben-ryder/jigsaw-react";
import {useNewContentDialog} from "../../../features/new-content/new-content-dialog";
import {useStatusDialog} from "../../../features/status/status-dialog";
import {useSearchDialog} from "../../../features/search/dialog/search-dialog";
import {useDataStructureDialog} from "../../../features/data-structure/data-structure-dialog";
import { useViewsDialog } from "../../../features/views/dialog/views-dialog";
import {useContentListDialog} from "../../../features/content-list/dialog/content-list-dialog";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {useDatabaseManagerDialogContext} from "../../../features/databases/manager/database-manager-context";
import classNames from "classnames";
import {useAccountDialog} from "../../../features/account/account-dialog";
import {useDatabase} from "@headbase-toolkit/react/use-database";
import {LiveQueryStatus} from "@headbase-toolkit/control-flow";
import {useEffect} from "react";

export interface WithMenuPanelProps {
	isMenuPanelOpen: boolean
	setIsMenuPanelOpen: (isOpen: boolean) => void
}

export function MenuPanel(props: WithMenuPanelProps) {
	const {setOpenTab: setDatabaseManagerDialogTab } = useDatabaseManagerDialogContext()
	const {setIsOpen: setNewContentDialogOpen } = useNewContentDialog()
	const {setIsOpen: setStatusDialogOpen } = useStatusDialog()
	const {setIsOpen: setSearchDialogOpen } = useSearchDialog()
	const {setIsOpen: setDataStructureDialogOpen } = useDataStructureDialog()
	const {setIsOpen: setViewsDialogOpen } = useViewsDialog()
	const {setIsOpen: setContentListDialogOpen } = useContentListDialog()
	const {setIsOpen: setAccountDialogOpen } = useAccountDialog()

	const { currentDatabaseId, headbase } = useHeadbase()
	const currentDatabase = useDatabase(currentDatabaseId)

	// todo: put this logic somewhere else?
	// Ensure the current user is still authenticated
	useEffect(() => {
		async function refreshCurrentUser() {
			if (!headbase) return

			const currentUser = await headbase.server.getCurrentUser()
			if (currentUser) {
				try {
					await headbase.server.refresh()
				}
				catch (e) {
					// todo: improve error handling. Show toast of some kind?
					alert('Your server session has expired, you need to log in again')
				}
			}
		}
		refreshCurrentUser()
	}, [headbase]);

	return (
		// todo: review accessibility of showing/hiding menu
		<div className={classNames('menu-panel', {'menu-panel--menu-hidden': !props.isMenuPanelOpen})}>
			<div className="menu-panel__database">
				<div className="menu-panel__database-content">
					<JTooltip content="All Databases" renderAsChild={true} variant='dark'>
						<button
							className="menu-panel__database-switch"
							onClick={() => {
								setDatabaseManagerDialogTab({type: 'list'})
							}}
						><JIcon><DatabaseListIcon /></JIcon></button>
					</JTooltip>
					<JTooltip content='Edit Database' renderAsChild={true} variant='dark'>
						<button
							className="menu-panel__database-edit"
							onClick={() => {
								if (currentDatabase.status === LiveQueryStatus.SUCCESS) {
									setDatabaseManagerDialogTab({type: 'edit', databaseId: currentDatabase.result.id})
								}
							}}
						>
							<span className="menu-panel__database-name" tabIndex={-1}>{currentDatabase.status === LiveQueryStatus.SUCCESS && currentDatabase.result.name}</span>
							{currentDatabase && <JIcon size='sm'><EditIcon/></JIcon>}
						</button>
					</JTooltip>
				</div>
			</div>

			<div className="menu-panel__actions">
				<MainPanelAction
					text='New Content'
					icon={<NewContentIcon/>}
					onSelect={() => {
						setNewContentDialogOpen(true)
					}}
					isSpecial={true}
				/>
				<MainPanelAction
					text='Search'
					icon={<SearchIcon/>}
					onSelect={() => {
						setSearchDialogOpen(true)
					}}
				/>
				<MainPanelAction
					text='All Content'
					icon={<AllContentIcon/>}
					onSelect={() => {
						setContentListDialogOpen(true)
					}}
				/>
				<MainPanelAction
					text='All Views'
					icon={<AllViewsIcon/>}
					onSelect={() => {
						setViewsDialogOpen(true)
					}}
				/>
				<MainPanelAction
					text='Data Structure'
					icon={<DataStructureIcon/>}
					onSelect={() => {
						setDataStructureDialogOpen(true)
					}}
				/>
			</div>

			<div className="menu-panel__favorites">
				<div className="menu-panel__favorites-header">
					<h3>Favorite Views</h3>
				</div>
				<div>
					No Favorites Found
				</div>
			</div>

			<div className="menu-panel__favorites">
				<div className="menu-panel__favorites-header">
					<h3>Favorite Content</h3>
				</div>
				<div>
					No Favorites Found
				</div>
			</div>

			<div className="menu-panel__user">
				<div className="menu-panel__user-content">
					<JTooltip content="Account" renderAsChild={true} variant='dark'>
						<button
							aria-label='Open account settings'
							className="menu-panel__account"
							onClick={() => {
								setAccountDialogOpen(true)
							}}
						><AccountIcon/></button>
					</JTooltip>
					<JTooltip content='Logs' renderAsChild={true} variant='dark'>
						<button
							aria-label='Open application logs'
							className="menu-panel__logs"
							onClick={() => {
								setStatusDialogOpen(true);
							}}
						><JIcon><StatusDownloadIcon /></JIcon></button>
					</JTooltip>
					<JTooltip content="Help" renderAsChild={true} variant='dark'>
						<button
							aria-label='Open help'
							className="menu-panel__help"
						><HelpIcon/></button>
					</JTooltip>
					<JTooltip content="Collapse Menu" renderAsChild={true} variant='dark'>
						<button
							aria-label='Collapse Menu'
							className="menu-panel__menu"
							onClick={() => {
								props.setIsMenuPanelOpen(false)
							}}
						><CollapseMenuIcon/></button>
					</JTooltip>
				</div>
			</div>
		</div>
	)
}