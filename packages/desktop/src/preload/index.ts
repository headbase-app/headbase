import { contextBridge } from 'electron'

// Custom APIs for renderer
const test = () => {
	console.log('Hello World')
}

contextBridge.exposeInMainWorld('test', test)
