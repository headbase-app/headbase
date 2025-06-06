import {resolveDirectoryPath} from "./common.ts";

/**
 * Create a directory with the given path, with support for recursively creating all directories.
 *
 * @param path
 */
export async function mkdir(path: string) {
	return resolveDirectoryPath(path, {create: true})
}
