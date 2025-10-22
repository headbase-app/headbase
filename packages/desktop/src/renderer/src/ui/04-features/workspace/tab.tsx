import {clsx} from "clsx";
import {X as CloseIcon} from "lucide-react"

export interface TabProps {
	name: string
	isActive?: boolean
	isUnsaved: boolean
	onSelect: () => void
	onClose: () => void
}

export function Tab(props: TabProps) {
	return (
		<div className='bg-navy-50 rounded-md flex items-center h-full p-2'>
			<button
				onClick={() => {props.onSelect()}}
				className={clsx('hover:underline text-navy-white-50', {
					'text-teal-50': props.isActive
				})}
			>
				{props.name}
				{props.isUnsaved && <span className='workspace-tab __save-status'><span className='j-hidden'>[unsaved]</span></span>}
			</button>
			<button className='' onClick={() => {props.onClose()}} aria-label={`Close tab ${props.name}`}><CloseIcon /></button>
		</div>
	)
}
