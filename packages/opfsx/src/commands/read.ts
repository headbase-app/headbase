import {resolveFilePath} from "../common.js";

// todo: use file.type / extension to support different file types?
// todo: automatically create object URLs for things like images, audio etc?
export async function read(path: string) {
	const fileHandle = await resolveFilePath(path)
	return fileHandle.getFile()
}
