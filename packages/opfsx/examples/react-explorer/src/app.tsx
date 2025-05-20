import './app.css'
import {useEffect, useState} from "react";

import * as opfs from "opfsx"
import type {OPFSFile, OPFSDirectoryWithChildren} from "opfsx";

// @ts-expect-error -- adding to window for allow inspecting/using in browser.
window.opfs = opfs

export default function App() {
  const [fileSystem, setFileSystem] = useState<OPFSDirectoryWithChildren|null>(null)

  useEffect(() => {
    async function load() {
      const fs = await opfs.tree("/")
      setFileSystem(fs)
    }
    load()
  }, []);

  return (
    <div className="m-4">
      <h1 className="font-bold text-2xl">OPFSX Explorer</h1>
      <div className="mt-3">
        {fileSystem?.children.map((item) => (
          <FileSystemItem key={item.path} {...item} />
        ))}
      </div>
    </div>
  )
}

function FileSystemItem(props: OPFSFile | OPFSDirectoryWithChildren) {
  if (props.kind === "file") {
    return (
      <div className="flex gap-3 items-center" data-path={props.path}>
        <p>{props.name}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-3 items-center" data-path={props.path}>
        <p className="font-bold">{props.name}</p>
      </div>
      <div style={{paddingLeft: "20px"}}>
        {props.children.map(item => (
          <FileSystemItem key={item.path} {...item} />
        ))}
      </div>
    </div>
  )
}
