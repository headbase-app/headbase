import { writeFile as nodeWriteFile } from "node:fs/promises"
import { join } from "node:path"

export async function writeFile(vaultPath: string, filePath: string, data: ArrayBuffer): Promise<void> {
	const platformPath = join(vaultPath, filePath);
	const bufferView = new Uint8Array(data);
	// w+ is used to support creating the file if it doesn't already exist
	await nodeWriteFile(platformPath, bufferView, {flag: 'w+'});

	console.debug(`[files] writeFile '${platformPath}' completed`)
}
