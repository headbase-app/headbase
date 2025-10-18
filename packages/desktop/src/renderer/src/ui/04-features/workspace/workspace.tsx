import {ReactNode} from "react";
import {clsx} from "clsx";
import {ChevronLast as ExpandMenuIcon} from "lucide-react";
import {useWorkspace} from "./framework/use-workspace";
import {Tab, TabProps} from "./tab";
import {FileTab} from "@ui/04-features/file-tab/file-tab";
import {Tooltip} from "@ui/02-components/tooltip/tooltip";
import {FileSystemExplorer} from "@ui/04-features/file-system/file-system-explorer";
import {WithMenuPanelProps} from "@ui/04-features/menu-panel/menu-panel";


export interface WithTabData {
	tabIndex: number
}

export function Workspace(props: WithMenuPanelProps) {
	const {tabs, closeTab, setActiveTab, activeTab} = useWorkspace()

	const workspaceTabs: TabProps[] = []
	const workspaceContent: ReactNode[] = []

	for (const [tabIndex, tab] of tabs.entries()) {
		let tabName;
		let tabContent: ReactNode = <p>{tab.type}</p>
		switch (tab.type) {
			case "search": {
				tabName = 'Search'
				tabContent = <p>Search content here...</p>
				break;
			}
			case "file-new": {
				tabName = tab.name ?? 'Untitled'
				tabContent = <FileTab tabIndex={tabIndex} />
				break;
			}
			case "file": {
				tabName = tab.name ?? 'Untitled'
				tabContent = <FileTab filePath={tab.filePath} tabIndex={tabIndex} />
				break;
			}
			case "file-explorer": {
				tabName = "File Explorer"
				tabContent = <FileSystemExplorer />
				break;
			}
			case "settings": {
				tabName = "Vault Settings"
				tabContent = <p>vault settings</p>
				break;
			}
			default: {
				tabName = 'Unknown Tab'
				tabContent = <p>A tab was opened that is not recognised by the workspace.</p>
				break;
			}
		}

		workspaceTabs.push({
			name: tabName,
			isUnsaved: !!tab.isUnsaved,
			isActive: activeTab === tabIndex,
			onClose: () => {closeTab(tabIndex)},
			onSelect: () => {setActiveTab(tabIndex)}
		})

		workspaceContent.push(tabContent)
	}

	return (
		<div className={clsx('w-full h-25')}>
			{!props.isMenuPanelOpen && (
				<Tooltip content='Show menu' renderAsChild={true}>
					<button
						className='workspace__menu-button'
						onClick={() => {props.setIsMenuPanelOpen(true)}}
						aria-label='Show Menu'
					><ExpandMenuIcon size={24}/></button>
				</Tooltip>
			)}
			{workspaceTabs.length > 0 && (
				<div className='bg-navy-40 w-full h-full flex items-center p-4'>
					<ul className='flex items-center gap-2 h-full'>
						{workspaceTabs.map((tab, tabIndex) => (
							<li className='h-full' key={tabIndex}>
								<Tab {...tab} />
							</li>
						))}
					</ul>
				</div>
			)}
			<div className='workspace-area'>
				{workspaceContent.map((tabContent, tabIndex) => (
					<div key={tabIndex} style={{display: activeTab === tabIndex ? 'block' : 'none'}}>
						{tabContent}
					</div>
				))}
				{workspaceContent.length === 0 && (
					<p>Placeholder view</p>
				)}
			</div>
		</div>
	)
}
