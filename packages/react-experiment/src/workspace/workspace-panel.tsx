import {useEffect, useRef, useState} from "react";
import {type ReactNode, type MouseEvent as ReactMouseEvent} from "react";
import {useWorkspace} from "./use-workspace/use-workspace.ts";

export interface WorkspacePanelProps {
	children: ReactNode
	dropTarget: HTMLDivElement
}

export function WorkspacePanel({
	children,
	dropTarget,
}: WorkspacePanelProps) {
	const { workspace } = useWorkspace()
	const [x, setX] = useState(0);
	const [y, setY] = useState(0);

	// const [isDragging, setIsDragging] = useState(false);
	//
	// const dragHandleRef = useRef<HTMLDivElement>(null);
	//
	// const onMouseDown = (e: ReactMouseEvent) => {
	// 	setIsDragging(true)
	// 	console.debug('drag start')
	// }
	//
	// const onMouseUp = (e: MouseEvent) => {
	// 	if (isDragging) {
	// 		console.debug('drag end, setting new x/y')
	// 		setX(e.pageX - workspace.offset.x)
	// 		setY(e.pageY - workspace.offset.y)
	// 	}
	//
	// 	console.debug('drag end')
	// 	setIsDragging(false)
	// }
	//
	// useEffect(() => {
	// 	document.addEventListener('mouseup', onMouseUp)
	//
	// 	return () => {
	// 		document.removeEventListener('mouseup', onMouseUp)
	// 	}
	// }, [isDragging]);
	const panelRef = useRef<HTMLDivElement | null>(null);

	function handleDragStart(e: DragEvent) {
		if (panelRef.current) {
			e.dataTransfer?.setDragImage(panelRef.current, 0, 0,)
		}

		// todo: some way to identify panel so can be used in workspace to move panel
		const dragData = {
			id: ''
		}
		e.dataTransfer?.setData('application/json', JSON.stringify(dragData))
	}

	return (
		<div
			ref={panelRef}
			style={{
				top: y,
				left: x
			}}
			className="workspace-panel"
		>
			<div
				className="workspace-panel-drag-handle"
				draggable={true}
				onDragStart={handleDragStart}
			/>
			<div className="workspace-panel-content">
				{children}
			</div>
		</div>
	)
}