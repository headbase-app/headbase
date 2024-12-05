
import {
	CircleCheck as StatusIcon,
	PlusSquare as NewContentIcon,
	Search as SearchIcon,
	List as AllContentIcon,
	Filter as AllViewsIcon,
	Shapes as DataStructureIcon,
	HelpCircle as HelpIcon,
	UserCircle as AccountIcon,
	ChevronFirst as CollapseMenuIcon,
	ChevronDown as DownArrowIcon,
	Settings as SettingsIcon
} from "lucide-react"
import {MainPanelAction} from "./main-panel-action";

import './menu-panel.scss'
import { JIcon, JTooltip } from "@ben-ryder/jigsaw-react";
import classNames from "classnames";
import {useEffect} from "react";
import {useDatabaseManagerDialogContext} from "../../features/databases/manager/database-manager-context.tsx";
import {useNewContentDialog} from "../../features/new-content/new-content-dialog.tsx";
import {useStatusDialog} from "../../features/status/status-dialog.tsx";
import {useSearchDialog} from "../../features/search/dialog/search-dialog.tsx";
import {useDataStructureDialog} from "../../features/data-structure/data-structure-dialog.tsx";
import {useViewsDialog} from "../../features/views/dialog/views-dialog.tsx";
import {useContentListDialog} from "../../features/content-list/dialog/content-list-dialog.tsx";
import {useAccountDialog} from "../../features/account/account-dialog.tsx";
import {useHeadbase} from "../../../logic/react/use-headbase.tsx";
import {useDatabase} from "../../../logic/react/databases/use-database.tsx";
import {LiveQueryStatus} from "../../../logic/control-flow.ts";


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
		<div className={classNames('menu-panel', {'menu-panel--collapsed': !props.isMenuPanelOpen})}>
			<div className="menu-panel__top">
				<JTooltip content='Manage databases' renderAsChild={true} variant='dark'>
					<button
						className="menu-panel__database-edit"
						onClick={() => {
							if (currentDatabase.status === LiveQueryStatus.SUCCESS) {
								setDatabaseManagerDialogTab({type: 'edit', databaseId: currentDatabase.result.id})
							}
						}}
					>
						<span className="menu-panel__database-name" tabIndex={-1}>{currentDatabase.status === LiveQueryStatus.SUCCESS && currentDatabase.result.name}</span>
						{currentDatabase && <JIcon><DownArrowIcon width={2} /></JIcon>}
					</button>
				</JTooltip>
				<JTooltip content='App status' renderAsChild={true} variant='dark'>
					<button
						aria-label='Database status'
						className="menu-panel__status"
						onClick={() => {
							setStatusDialogOpen(true);
						}}
					><JIcon><StatusIcon /></JIcon></button>
				</JTooltip>
				<JTooltip content='Create content' renderAsChild={true} variant='dark'>
					<button
						className="menu-panel__create"
						onClick={() => {
							setNewContentDialogOpen(true)
						}}
					>
						<JIcon><NewContentIcon/></JIcon>
					</button>
				</JTooltip>
			</div>

			<div className="menu-panel__actions">
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

			<div className="menu-panel__content-items">
				<div className="menu-panel__favorites-header">
					<h3>Content items</h3>
				</div>
				<div>
					No items found
				</div>
			</div>

			<div className="menu-panel__bottom">
				<JTooltip content="Account settings" renderAsChild={true} variant='dark'>
					<button
						aria-label='Account settings'
						className="menu-panel__account"
						onClick={() => {
							setAccountDialogOpen(true)
						}}
					><AccountIcon/></button>
				</JTooltip>
				<JTooltip content="Settings" renderAsChild={true} variant='dark'>
					<button
						aria-label='Settings'
						className="menu-panel__settings"
					><SettingsIcon/></button>
				</JTooltip>
				<JTooltip content="Help" renderAsChild={true} variant='dark'>
					<button
						aria-label='Help'
						className="menu-panel__help"
					><HelpIcon/></button>
				</JTooltip>
				<JTooltip content="Hide menu" renderAsChild={true} variant='dark'>
					<button
						aria-label='Hide menu'
						className="menu-panel__menu"
						onClick={() => {
							props.setIsMenuPanelOpen(false)
						}}
					><CollapseMenuIcon/></button>
				</JTooltip>
			</div>
		</div>
	)
}