import classNames from "classnames";
import {X as CloseIcon} from "lucide-react"
import {JIcon} from "@ben-ryder/jigsaw-react";

export interface TabProps {
	name: string
	isActive?: boolean
	isUnsaved: boolean
	onSelect: () => void
	onClose: () => void
}

export function Tab(props: TabProps) {
	return (
		<div className={classNames('workspace-tab', {
			'workspace-tab --active': props.isActive
		})}>
			<button className='workspace-tab __select' onClick={() => {props.onSelect()}}>
				{props.name}
				{props.isUnsaved && <span className='workspace-tab __save-status'><span className='j-hidden'>Unsaved</span></span>}
			</button>
			<button className='workspace-tab __close' onClick={() => {props.onClose()}} aria-label={`Close tab ${props.name}`}><JIcon size='xs'><CloseIcon /></JIcon></button>
		</div>
	)
}
