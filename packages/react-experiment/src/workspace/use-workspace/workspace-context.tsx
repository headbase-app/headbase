import {createContext, type Dispatch, type SetStateAction} from "react";

export const WORKSPACE_GRID_SIZE = 24;
export const WORKSPACE_ZOOM_MIN = 0.5
export const WORKSPACE_ZOOM_MAX = 2

export interface Workspace {
	zoom: number,
	offset: {
		x: number,
		y: number
	}
	isLocked: boolean
}

export interface WorkspaceContext {
	workspace: Workspace;
	setWorkspace: Dispatch<SetStateAction<Workspace>>
}

export const DEFAULT_WORKSPACE_CONTEXT = {
	workspace: {
		zoom: 1,
		offset: {
			// Set offset so 0,0 is visible and not in very top corner of screen
			x: 2 * WORKSPACE_GRID_SIZE,
			y: 2 * WORKSPACE_GRID_SIZE
		},
		isLocked: false,
	},
	setWorkspace: () => {}
}

export const WorkspaceContext = createContext<WorkspaceContext>(DEFAULT_WORKSPACE_CONTEXT)
