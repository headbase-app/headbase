import {type PropsWithChildren, useCallback, useState} from "react";
import {WorkspaceContext} from "./workspace-context.tsx";
import type {WorkspacePanelProps} from "../workspace-panel.tsx";
import type {Coordinates} from "@dnd-kit/utilities";

export interface CoordinatesDelta {
	deltaX: number;
	deltaY: number;
}

export function WorkspaceProvider({children}: PropsWithChildren) {
	const [zoom, setZoom] = useState(1)
	const [position, setPosition] = useState<Coordinates>({x: 0, y: 0})
	const [isLocked, setIsLocked] = useState(false)

	const [panels, setPanels] = useState<WorkspacePanelProps[]>([])

	const addPanel = useCallback((panel: WorkspacePanelProps) => {
		setPanels((prev) => [...prev, panel])
	}, [setPanels])

	const movePanel = useCallback((id: string, coordinatesDelta: CoordinatesDelta) => {
		setPanels((prev) => {
			return prev.map((panel) => {
				if (panel.id === id) {
					return {
						...panel,
						coordinates: {
							x: panel.coordinates.x + coordinatesDelta.deltaX,
							y: panel.coordinates.y + coordinatesDelta.deltaY
						}
					}
				}
				return panel
			})
		})
	}, [setPanels])

	const removePanel = useCallback((id: string) => {
		setPanels((prev) => {
			return prev.filter((panel) => panel.id !== id)
		})
	}, [setPanels])

	const value: WorkspaceContext = {
		zoom, setZoom,
		position, setPosition,
		isLocked, setIsLocked,
		panels, addPanel, movePanel, removePanel,
	}

	return (
		<WorkspaceContext.Provider value={value}>
			{children}
		</WorkspaceContext.Provider>
	)
}
