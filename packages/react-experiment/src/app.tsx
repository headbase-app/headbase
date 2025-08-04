import {Workspace} from "./workspace/workspace.tsx";
import {Shelves} from "./shelf/shelves.tsx";
import "./app.css"
import {WorkspaceProvider} from "./workspace/use-workspace/workspace-provider.tsx";


export function App() {
  return (
    <WorkspaceProvider>
      <Shelves />
      <Workspace />
    </WorkspaceProvider>
  )
}
