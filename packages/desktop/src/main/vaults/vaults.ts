import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {CreateVaultDto, UpdateVaultDto, Vault} from '../../contracts/vaults'

const VAULTS_FILE = 'vaults.json'

export async function createVault(dataPath: string, createVaultDto: CreateVaultDto) {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)
	const vaults = await getVaults(dataPath)

	// todo: validate path, such as restricting access to system folders etc
	const newVault: Vault = {
		id: '',
		displayName: createVaultDto.displayName,
		path: createVaultDto.path,
	}
	vaults.push(newVault)

	const contents = JSON.stringify(vaults)
	await writeFile(vaultsFilePath, contents)

	return newVault
}

export async function updateVault(dataPath: string, vaultId: string, updateVaultDto: UpdateVaultDto) {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)
	const vaults = await getVaults(dataPath)

	const updatedVaults: Vault[] = []
	let isUpdated = false
	for (const vault of vaults) {
		if (vault.id === vaultId) {
			updatedVaults.push({
				...vault,
				displayName: updateVaultDto.displayName,
			})
		}
		else {
			updatedVaults.push(vault)
		}

		isUpdated = true
	}

	if (!isUpdated) {
		throw new Error("Vault not found")
	}

	const contents = JSON.stringify(updatedVaults)
	await writeFile(vaultsFilePath, contents)
}

export async function deleteVault(dataPath: string, vaultId: string) {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)

	const vaults = await getVaults(dataPath)
	const updatedVaults = vaults.filter(vault => vault.id !== vaultId)

	if (vaults.length === updatedVaults.length) {
		throw new Error("Vault not found")
	}

	const contents = JSON.stringify(updatedVaults)
	await writeFile(vaultsFilePath, contents)
}

export async function getVault(dataPath: string, vaultId: string) {
	const vaults = await getVaults(dataPath)

	for (const vault of vaults) {
		if (vault.id === vaultId) {
			return vault
		}
 	}

	return null
}

export async function getVaults(dataPath: string): Promise<Vault[]> {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)

	try {
		const contents = await readFile(vaultsFilePath, { encoding: 'utf8' })
		// todo: validate parsed data based on schema
		return  JSON.parse(contents) as Vault[]
	} catch (error) {
		// todo: only suppress file not found error?
		console.debug(`[vaults] vault file not found (${error})`)
	}

	return []
}
