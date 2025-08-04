import {useContext} from "react";
import {WorkspaceContext} from "./workspace-context.tsx";

export const useWorkspace = () => useContext(WorkspaceContext)
