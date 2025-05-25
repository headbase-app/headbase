
import {
	CircleCheck as StatusIcon,
	PlusSquare as NewContentIcon,
	Search as SearchIcon,
	HelpCircle as HelpIcon,
	ChevronFirst as CollapseMenuIcon,
	ChevronDown as DownArrowIcon,
	Settings as SettingsIcon,
	FolderTreeIcon as FilesIcon,
	UserCircle as AccountIcon
} from "lucide-react"
import {MainPanelAction} from "./main-panel-action";

import './menu-panel.scss'
import { JIcon, JTooltip } from "@ben-ryder/jigsaw-react";
import classNames from "classnames";
import {useEffect} from "react";
import {useDatabaseManagerDialogContext} from "../../features/databases/manager/database-manager-context.tsx";
import {useStatusDialog} from "../../features/status/status-dialog.tsx";
import {useSettingsDialog} from "../../features/settings/settings-dialog.tsx";
import {useHeadbase} from "../../../logic/react/use-headbase.tsx";
import {useDatabase} from "../../../logic/react/databases/use-database.tsx";
import {LiveQueryStatus} from "../../../logic/control-flow.ts";
import {useWorkspaceContext} from "../../features/workspace/workspace-context.tsx";
import {FavouritesList} from "../../features/favorites/favourites-list.tsx";


export interface WithMenuPanelProps {
	isMenuPanelOpen: boolean
	setIsMenuPanelOpen: (isOpen: boolean) => void
}

export function MenuPanel(props: WithMenuPanelProps) {
	const {setOpenTab: setDatabaseManagerDialogTab } = useDatabaseManagerDialogContext()
	const {setIsOpen: setStatusDialogOpen } = useStatusDialog()
	const {setIsOpen: setAccountDialogOpen } = useSettingsDialog()

	const { currentDatabaseId, headbase } = useHeadbase()
	const currentDatabase = useDatabase(currentDatabaseId)
	const { openTab } = useWorkspaceContext()

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
								setDatabaseManagerDialogTab({type: 'list'})
							}
						}}
					>
						<span className="menu-panel__database-name" tabIndex={-1}>{currentDatabase.status === LiveQueryStatus.SUCCESS && currentDatabase.result.name}</span>
						{currentDatabase && <JIcon><DownArrowIcon width={2} /></JIcon>}
					</button>
				</JTooltip>
				<JTooltip content='View app status' renderAsChild={true} variant='dark'>
					<button
						aria-label='Database status'
						className="menu-panel__status"
						onClick={() => {
							setStatusDialogOpen(true);
						}}
					><JIcon><StatusIcon /></JIcon></button>
				</JTooltip>
				<JTooltip content='Create new file' renderAsChild={true} variant='dark'>
					<button
						className="menu-panel__create"
						onClick={() => {
							openTab({type: 'file-new'}, {switch: true})
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
						openTab({type: 'search'}, {switch: true})
					}}
				/>
				<MainPanelAction
					text='Explorer'
					icon={<FilesIcon />}
					onSelect={() => {
						openTab({type: 'file-explorer'}, {switch: true})
					}}
				/>
				<MainPanelAction
					text='Settings'
					icon={<SettingsIcon />}
					onSelect={() => {
						openTab({type: 'settings'}, {switch: true})
					}}
				/>
			</div>

			<div className="menu-panel__content-items">
				<div className="menu-panel__favorites-header">
					<h3>Favourites</h3>
				</div>
				<FavouritesList />
			</div>

			<div className="menu-panel__bottom">
				<JTooltip content="Manage account" renderAsChild={true} variant='dark'>
					<button
						aria-label='Account settings'
						className="menu-panel__settings"
						onClick={() => {
							setAccountDialogOpen(true)
						}}
					><AccountIcon/></button>
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