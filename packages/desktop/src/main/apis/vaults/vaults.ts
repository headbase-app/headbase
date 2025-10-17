import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {CreateVaultDto, UpdateVaultDto, LocalVaultDto} from '../../../contracts/vaults'

const VAULTS_FILE = 'vaults.json'

export async function createVault(dataPath: string, createVaultDto: CreateVaultDto) {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)
	const vaults = await queryVaults(dataPath)

	// todo: validate path, such as restricting access to system folders etc
	const newVault: LocalVaultDto = {
		id: createVaultDto.id,
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
	const vaults = await queryVaults(dataPath)

	let updatedVault: LocalVaultDto | null = null
	const newVaults: LocalVaultDto[] = []
	for (const vault of vaults) {
		if (vault.id === vaultId) {
			updatedVault = {
				...vault,
				...updateVaultDto
			}
			newVaults.push(updatedVault)
		}
		else {
			newVaults.push(vault)
		}
	}

	if (!updatedVault) {
		throw new Error("Vault not found")
	}

	const contents = JSON.stringify(newVaults)
	await writeFile(vaultsFilePath, contents)

	return updatedVault
}

export async function deleteVault(dataPath: string, vaultId: string) {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)

	const vaults = await queryVaults(dataPath)
	const updatedVaults = vaults.filter(vault => vault.id !== vaultId)

	if (vaults.length === updatedVaults.length) {
		throw new Error("Vault not found")
	}

	const contents = JSON.stringify(updatedVaults)
	await writeFile(vaultsFilePath, contents)
}

export async function getVault(dataPath: string, vaultId: string) {
	const vaults = await queryVaults(dataPath)

	for (const vault of vaults) {
		if (vault.id === vaultId) {
			return vault
		}
 	}

	return null
}

export async function queryVaults(dataPath: string): Promise<LocalVaultDto[]> {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)

	try {
		const contents = await readFile(vaultsFilePath, { encoding: 'utf8' })
		// todo: validate parsed data based on schema
		return JSON.parse(contents) as LocalVaultDto[]
	} catch (error) {
		// todo: only suppress file not found error?
		console.debug(`[vaults] vault file not found (${error})`)
	}

	return []
}
