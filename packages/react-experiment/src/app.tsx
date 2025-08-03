import {Workspace} from "./workspace/workspace.tsx";
import {Shelves} from "./shelf/shelves.tsx";
import "./app.css"


export function App() {
  return (
    <div>
      <Shelves />
      <Workspace />
    </div>
  )
}
