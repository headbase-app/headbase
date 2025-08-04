import {type PropsWithChildren, useState} from "react";
import {DEFAULT_WORKSPACE_CONTEXT, type Workspace, WorkspaceContext} from "./workspace-context.tsx";

export function WorkspaceProvider({children}: PropsWithChildren) {
	const [workspace, setWorkspace] = useState<Workspace>(DEFAULT_WORKSPACE_CONTEXT.workspace)

	const value = {
		workspace, setWorkspace
	}

	return (
		<WorkspaceContext.Provider value={value}>
			{children}
		</WorkspaceContext.Provider>
	)
}
