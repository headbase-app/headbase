import {readdir} from "node:fs/promises";

export async function flatTree(directoryPath: string) {
	const children = await readdir(directoryPath, {recursive: true})
	return children
}
