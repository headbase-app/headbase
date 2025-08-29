import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {Vault, VaultMap} from '../../contracts/vaults'

const VAULTS_FILE = 'vaults.json'

export async function getVaults(dataPath: string): Promise<VaultMap> {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)

	try {
		const contents = await readFile(vaultsFilePath, { encoding: 'utf8' })
		// todo: validate file based on schema
		const vaultList: Vault[] = JSON.parse(contents)

		return Object.fromEntries(vaultList.map(v => [v.id, v]))
	} catch (error) {
		console.debug(`[vaults] vault file not found (${error})`)
	}

	return {}
}

export async function saveVaults(dataPath: string, vaults: Vault[]) {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)
	const contents = JSON.stringify(vaults)
	await writeFile(vaultsFilePath, contents)
}
