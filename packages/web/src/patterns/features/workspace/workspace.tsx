import {useWorkspaceContext} from "./workspace-context";
import {Tab, TabProps} from "./tab";
import {ReactNode} from "react";
import {FileEditorTab} from "../file-editor/file-editor-tab.tsx";

// todo: split styling by component for better encapsulation
import "./workspace.scss"
import {SearchTab} from "../search/tab/search-tab.tsx";
import classNames from "classnames";
import { ChevronLast as ExpandMenuIcon} from "lucide-react";
import {JTooltip} from "@ben-ryder/jigsaw-react";
import {WithMenuPanelProps} from "../../layout/menu-panel/menu-panel.tsx";
import {FileSystemExplorer} from "../file-system-explorer/file-system-explorer.tsx";
import {VaultSettingsPage} from "../vault-settings/vault-settings-page.tsx";

export interface WithTabData {
	tabIndex: number
}

export function Workspace(props: WithMenuPanelProps) {
	const {tabs, closeTab, setActiveTab, activeTab} = useWorkspaceContext()

	const workspaceTabs: TabProps[] = []
	const workspaceContent: ReactNode[] = []

	for (const [tabIndex, tab] of tabs.entries()) {
		let tabName;
		let tabContent: ReactNode = <p>{tab.type}</p>
		switch (tab.type) {
			case "search": {
				tabName = 'Search'
				tabContent = <SearchTab />
				break;
			}
			case "file-new": {
				tabName = tab.name ?? 'Untitled'
				tabContent = <FileEditorTab tabIndex={tabIndex} />
				break;
			}
			case "file": {
				tabName = tab.name ?? 'Untitled'
				tabContent = <FileEditorTab path={tab.path} tabIndex={tabIndex} />
				break;
			}
			case "file-explorer": {
				tabName = "File Explorer"
				tabContent = <FileSystemExplorer />
				break;
			}
			case "settings": {
				tabName = "Vault Settings"
				tabContent = <VaultSettingsPage />
				break;
			}
			default: {
				tabName = 'Unknown Tag'
				tabContent = <p>A tab was opened that the workspace doesn't know how to deal with.</p>
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
		<div className={classNames('workspace', {'workspace--menu-hidden': !props.isMenuPanelOpen})}>
			{!props.isMenuPanelOpen && (
				<JTooltip content='Show menu' renderAsChild={true} variant='dark'>
					<button
						className='workspace__menu-button'
						onClick={() => {props.setIsMenuPanelOpen(true)}}
						aria-label='Show Menu'
					><ExpandMenuIcon size={24}/></button>
				</JTooltip>
			)}
			{workspaceTabs.length > 0 && (
				<div className='workspace-tabs'>
					<ul className='workspace-tabs__list'>
						{workspaceTabs.map((tab, tabIndex) => (
							<li className='workspace-tabs__list-item' key={tabIndex}>
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
				{/*{workspaceContent.length === 0 && (*/}
				{/*	<ContentList />*/}
				{/*)}*/}
			</div>
		</div>
	)
}