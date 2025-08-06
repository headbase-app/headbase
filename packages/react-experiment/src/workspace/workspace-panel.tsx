import {type ReactNode, useRef, type DragEvent} from "react";
import type {Coordinates} from "@dnd-kit/utilities";

export interface WorkspacePanelProps {
	children: ReactNode
	id: string
	coordinates: Coordinates
}

export function WorkspacePanel({
	children,
	id,
	coordinates,
}: WorkspacePanelProps) {
	const style = {
		transform: `translate3d(${coordinates.x}px, ${coordinates.y}px, 0)`,
	};

	const panelRef = useRef<HTMLDivElement>(null);

	function handleDragStart(event: DragEvent) {
		event.dataTransfer.dropEffect = "move";

		if (panelRef.current) {
			event.dataTransfer?.setDragImage(panelRef.current, 0, 0)
		}

		const data = {id}
		event.dataTransfer?.setData('application/json', JSON.stringify(data))
	}

	return (
		<div
			style={style}
			className="workspace-panel"
			ref={panelRef}
		>
			<div
				className="workspace-panel-drag-handle"
				draggable
				onDragStart={handleDragStart}
			/>
			<div className="workspace-panel-content">
				{children}
			</div>
		</div>
	)
}