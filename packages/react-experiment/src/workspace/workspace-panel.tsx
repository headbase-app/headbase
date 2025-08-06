import {type ReactNode, useEffect} from "react";
import {useDraggable} from "@dnd-kit/core";
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
	const {attributes, listeners, setNodeRef, transform} = useDraggable({id});
	const style = transform ? {
		transform: `translate3d(${coordinates.x + transform.x}px, ${coordinates.y + transform.y}px, 0)`,
	} : {
		transform: `translate3d(${coordinates.x}px, ${coordinates.y}px, 0)`,
	};

	return (
		<div
			style={style}
			className="workspace-panel"
			ref={setNodeRef}
			{...listeners}
			{...attributes}
		>
			<div
				className="workspace-panel-drag-handle"
			/>
			<div className="workspace-panel-content">
				{children}
			</div>
		</div>
	)
}