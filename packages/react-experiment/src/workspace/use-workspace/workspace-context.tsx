import {createContext, type Dispatch, type SetStateAction} from "react";
import type {WorkspacePanelProps} from "../workspace-panel.tsx";

export const WORKSPACE_GRID_SIZE = 24;
export const WORKSPACE_ZOOM_MIN = 0.5
export const WORKSPACE_ZOOM_MAX = 2

export interface WorkspacePosition {
	x: number
	y: number
}

export interface WorkspaceContext {
	zoom: number
	setZoom: Dispatch<SetStateAction<number>>
	position: WorkspacePosition
	setPosition: Dispatch<SetStateAction<WorkspacePosition>>
	isLocked: boolean
	setIsLocked: Dispatch<SetStateAction<boolean>>
	panels: WorkspacePanelProps[]
	addPanel: (panel: WorkspacePanelProps) => void
	movePanel: (id: string, coordinates: WorkspacePanelProps['coordinates']) => void
	removePanel: (id: string) => void
}

export const DEFAULT_WORKSPACE_CONTEXT: WorkspaceContext = {
	zoom: 1,
	setZoom: () => {},
	position: {
		// Set offset so 0,0 is visible and not in very top corner of screen
		x: 2 * WORKSPACE_GRID_SIZE,
		y: 2 * WORKSPACE_GRID_SIZE
	},
	setPosition: () => {},
	isLocked: false,
	setIsLocked: () => {},
	panels: [],
	addPanel: () => {},
	movePanel: () => {},
	removePanel: () => {},
}

export const WorkspaceContext = createContext<WorkspaceContext>(DEFAULT_WORKSPACE_CONTEXT)
