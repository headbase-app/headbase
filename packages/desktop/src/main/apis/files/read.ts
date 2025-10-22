import { readFile as nodeReadFile } from "node:fs/promises"
import { parse, join } from "node:path"
import {IFileBuffer, IFileStream} from "../../../renderer/src/api/files/files.interface";

export async function readFile(vaultPath: string, filePath: string): Promise<IFileBuffer> {
	const platformPath = join(vaultPath, filePath);
	// An encoding isn't supplied to allow editors within the application to decide how to interpret file contents,
	// and avoid imposing specific implementation decisions at this low level.
	const buffer = await nodeReadFile(platformPath);

	const parsedPath = parse(platformPath)
	return {
		fileName: parsedPath.base,
		folderPath: parsedPath.dir.replace(vaultPath, ""),
		platformPath: platformPath,
		buffer,
	}
}

export async function readFileStream(vaultPath: string, filePath: string): Promise<IFileStream> {
	const platformPath = join(vaultPath, filePath);

	const parsedPath = parse(platformPath)
	return {
		fileName: parsedPath.base,
		folderPath: parsedPath.dir.replace(vaultPath, ""),
		platformPath: platformPath,
		url: `hb-stream:${filePath}`,
	}
}
