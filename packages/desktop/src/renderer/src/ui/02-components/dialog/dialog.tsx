import {Description, Dialog as DialogRoot, DialogPanel, DialogTitle} from '@headlessui/react'
import {CSSProperties, ReactNode, useCallback} from "react";

import { X as CloseIcon } from "lucide-react";

export type DialogRole = 'dialog' | 'alertdialog'

export interface DialogProps {
	role?: DialogRole
	isOpen: boolean
	setIsOpen: (open: boolean) => void
	title: string
	description: string
	content: ReactNode
	/** Stop outside pointer clicks/interactions closing the dialog, ESC will still work.  **/
	disableOutsideClose?: boolean
	// Allow custom styles to be supplied, useful for things like settings specific or maximum dimensions.
	// todo: allow for specific dimension props instead of exposing style?
	style?: CSSProperties
}

export function Dialog({
	role,
	isOpen,
	setIsOpen,
	title,
	description,
	content,
	disableOutsideClose,
	style,
}: DialogProps) {
	const onClose = useCallback(() => {
		if (!disableOutsideClose) {
			setIsOpen(false)
		}
	}, [setIsOpen, disableOutsideClose])

	return (
		<DialogRoot
			open={isOpen}
			onClose={onClose}
			role={role}
		>
			<DialogPanel
				className="top-1/2 left-1/2 fixed w-[80%] overflow-y-scroll bg-navy-40 border-sm rounded-md -translate-1/2 shadow-sm border-2 border-navy-50 min-h-[50vh] overflow-x-hidden"
				style={style}
			>
				<div className="px-4 relative pt-24">
					<div>{content}</div>

					<div className="flex items-center justify-between absolute top-0 w-full min-h-24 left-0 px-4">
						<DialogTitle className="j-dialog__title">{title}</DialogTitle>
						<Description className="sr-only">
							{description}
						</Description>

						{role !== 'alertdialog' && (
							<button
								className="hover:bg-navy-50 rounded-md p-2 hover:cursor-pointer"
								onClick={() => {
								setIsOpen(false)
								}}
							>
								<CloseIcon/>
							</button>
						)}
					</div>
				</div>
			</DialogPanel>

			<div className='j-dialog__overlay'/>
		</DialogRoot>
	)
}
