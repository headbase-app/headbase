import {useContext} from "react";
import {WorkspaceContext} from "@ui/04-features/workspace/framework/workspace.context";

export const useWorkspace = () => useContext(WorkspaceContext)
