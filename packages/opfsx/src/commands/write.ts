// todo: support blobs/streams for saving other file types
// todo: require passing type, extract type from filename?
import {resolveFilePath} from "../common.js";

export async function write(path: string, content: string) {
	const fileHandle = await resolveFilePath(path, {create: true})
	const writable = await fileHandle.createWritable()
	await writable.write(content)
	await writable.close()
}
