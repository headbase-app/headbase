import {useWorkspaceContext} from "./workspace-context";
import {Tab, TabProps} from "./tab";
import {ReactNode} from "react";
import {ContentTab} from "../content/tab/content-tab";

// todo: split styling by component for better encapsulation
import "./workspace.scss"
import {ContentListTab} from "../content-list/tab/content-list-tab";
import {ViewEditTab} from "../views/tab/view-edit-tab";
import {ViewListTab} from "../views-list/tab/view-list-tab";
import {ViewTab} from "../views/tab/view-tab";
import classNames from "classnames";
import { ChevronLast as ExpandMenuIcon} from "lucide-react";
import {JProse, JTooltip} from "@ben-ryder/jigsaw-react";
import {WithMenuPanelProps} from "../../layout/menu-panel/menu-panel.tsx";
import {NewContentMenu} from "../new-content/new-content-menu/new-content-menu.tsx";

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
			case "content_new": {
				tabName = tab.name ?? 'Untitled'
				tabContent = <ContentTab contentTypeId={tab.contentTypeId} tabIndex={tabIndex} />
				break;
			}
			case "content": {
				tabName = tab.name ?? 'Untitled'
				tabContent = <ContentTab contentId={tab.contentId} tabIndex={tabIndex} />
				break;
			}
			case "content_list": {
				tabName = tab.name ?? 'All Content'
				tabContent = <ContentListTab />
				break;
			}
			case "view_new": {
				tabName = tab.name ?? 'Untitled'
				tabContent = <ViewEditTab tabIndex={tabIndex} />
				break;
			}
			case "view_edit": {
				tabName = tab.name ? `[edit] ${tab.name}` : 'Untitled'
				tabContent = <ViewEditTab viewId={tab.viewId} tabIndex={tabIndex} />
				break;
			}
			case "view": {
				tabName = tab.name ?? 'Untitled'
				tabContent = <ViewTab viewId={tab.viewId} tabIndex={tabIndex} />
				break;
			}
			case "view_list": {
				tabName = tab.name ?? 'All Views'
				tabContent = <ViewListTab />
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
				{workspaceContent.length === 0 && (
					<div className='workspace-empty-content'>
						<JProse>
							<p>Add new content</p>
						</JProse>
						<NewContentMenu />
					</div>
				)}
			</div>
		</div>
	)
}