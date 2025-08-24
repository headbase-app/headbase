import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Vault } from '../../types/vaults'

const VAULTS_FILE = 'vaults.json'

export async function loadVaults(dataPath: string): Promise<Vault[]> {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)

	try {
		const contents = await readFile(vaultsFilePath, { encoding: 'utf8' })
		return JSON.parse(contents)
	} catch (error) {
		console.error(error)
		console.debug('[vaults] vault file not found')
	}

	return [
		{
			id: '00000000-0000-0000-0000-000000000000',
			path: '~/headbase-example',
			displayName: 'Example'
		}
	]
}

export async function saveVaults(dataPath: string, vaults: Vault[]) {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)
	const contents = JSON.stringify(vaults)
	await writeFile(vaultsFilePath, contents)
}
