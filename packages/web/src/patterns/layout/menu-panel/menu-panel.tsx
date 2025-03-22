
import {
	CircleCheck as StatusIcon,
	PlusSquare as NewContentIcon,
	Search as SearchIcon,
	List as AllContentIcon,
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
import {useStatusDialog} from "../../features/status/status-dialog.tsx";
import {useAccountDialog} from "../../features/account/account-dialog.tsx";
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
	const {setIsOpen: setAccountDialogOpen } = useAccountDialog()

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
							openTab({type: 'object-new'}, {switch: true})
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
						openTab({type: 'all'}, {switch: true})
					}}
				/>
				<MainPanelAction
					text='Templates'
					icon={<DataStructureIcon/>}
					onSelect={() => {}}
				/>
				<MainPanelAction
					text='Views'
					icon={<AllContentIcon/>}
					onSelect={() => {}}
				/>
			</div>

			<div className="menu-panel__content-items">
				<div className="menu-panel__favorites-header">
					<h3>Favourites</h3>
				</div>
				<FavouritesList />
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