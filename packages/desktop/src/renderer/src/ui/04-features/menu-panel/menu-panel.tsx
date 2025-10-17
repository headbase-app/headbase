import {
	CircleCheck as StatusIcon,
	Plus as NewContentIcon,
	Search as SearchIcon,
	ChevronFirst as CollapseMenuIcon,
	ChevronDown as DownArrowIcon,
	HelpCircle as HelpIcon
} from "lucide-react"

import {Tooltip} from "@ui/02-components/tooltip/tooltip";
import {ErrorBoundary} from "react-error-boundary";
import {useCurrentVault} from "@framework/hooks/use-current-vault";
import {useWorkspace} from "@ui/04-features/workspace/framework/use-workspace";
import {useVaultManagerDialogContext} from "@ui/04-features/vaults/manager/vault-manager-context";
import {LiveQueryStatus} from "@contracts/query";
import {FileSystemExplorer} from "@ui/04-features/file-system/file-system-explorer";
import {clsx} from "clsx";


export interface WithMenuPanelProps {
	isMenuPanelOpen: boolean
	setIsMenuPanelOpen: (isOpen: boolean) => void
}

export function MenuPanel({isMenuPanelOpen, setIsMenuPanelOpen}: WithMenuPanelProps) {
	const {setOpenTab: setVaultManagerDialogTab} = useVaultManagerDialogContext()
	// const {setIsOpen: setStatusDialogOpen } = useStatusDialog()
	// const {setIsOpen: setAccountDialogOpen } = useSettingsDialog()

	const currentVaultQuery = useCurrentVault()
	const currentVault = currentVaultQuery.status === LiveQueryStatus.SUCCESS ? currentVaultQuery.result : undefined

	const {openTab} = useWorkspace()

	// todo: put this logic somewhere else?
	// Ensure the current user is still authenticated
	// useEffect(() => {
	// 	async function refreshCurrentUser() {
	// 		if (!headbase) return
	//
	// 		const currentUser = await headbase.server.getCurrentUser()
	// 		if (currentUser) {
	// 			try {
	// 				await headbase.server.refresh()
	// 			}
	// 			catch (e) {
	// 				// todo: improve error handling. Show toast of some kind?
	// 				alert('Your server session has expired, you need to log in again')
	// 			}
	// 		}
	// 	}
	// 	refreshCurrentUser()
	// }, [headbase]);

	const className = clsx("max-w-[300px] w-full h-full bg-theme-panel-bg relative", {
		'hidden': !isMenuPanelOpen
	})

	return (
		<div className={className}>

			<div
				className='absolute w-full top-0 left-0 h-25 bg-theme-panel-bg border-b-2 border-b-navy-50 flex items-center justify-between p-4'>
				<Tooltip content='Switch and manage vaults' renderAsChild={true} preferredPosition='bottom'>
					<button
						className="flex p-3 hover:bg-navy-50 rounded-md hover:cursor-pointer text-navy-white-50"
						onClick={() => {
							setVaultManagerDialogTab({type: 'list'})
						}}
					>
						<span tabIndex={-1}>{currentVault ? currentVault.displayName : 'Select Vault'}</span>
						{currentVault && <DownArrowIcon width={2}/>}
					</button>
				</Tooltip>
				<div>
					<Tooltip content='Search' preferredPosition='bottom' renderAsChild={true}>
						<button
							onClick={() => {openTab({type: 'search'})}}
						>
							<SearchIcon size={24}/>
						</button>
					</Tooltip>
					<Tooltip content='New file' preferredPosition='bottom' renderAsChild={true}>
						<button
							onClick={() => {openTab({type: 'file-new'})}}
						>
							<NewContentIcon size={24}/>
						</button>
					</Tooltip>
				</div>
			</div>
			<div className='max-h-[calc(100vh-30px-56px-56px)] overflow-y-scroll overflow-x-hidden my-25'>
				<ErrorBoundary fallback={<p>An error occurred</p>}>
					<FileSystemExplorer/>
				</ErrorBoundary>
			</div>
			<div className='absolute w-full bottom-0 left-0 h-25 bg-theme-panel-bg border-t-2 border-t-navy-50 flex items-center justify-between p-4 gap-2'>
				<div>
					<Tooltip content='View status' preferredPosition='top'>
						<StatusIcon size={28}/>
					</Tooltip>
					<Tooltip content='Help' preferredPosition='top'>
						<HelpIcon size={28}/>
					</Tooltip>
				</div>
				<div>
					<Tooltip content='Collapse panel' preferredPosition='top' renderAsChild={true}>
						<button
							onClick={() => {setIsMenuPanelOpen(false)}}
						>
							<CollapseMenuIcon size={28}/>
						</button>
					</Tooltip>
				</div>
			</div>
		</div>
	)
}
