import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from "node:crypto"
import {ZodError} from "zod";
import {BrowserWindow, dialog} from "electron"

// importing specific file to prevent including web only deps (like pdfjs-dist) in Node.js (see /docs/technical-debt.md)
import {CreateVaultDto, UpdateVaultDto, VaultList, VaultDto} from "@headbase-app/lib/dist/02-apis/vaults/vault.ts";

const VAULTS_FILE = 'vaults.json'

export async function selectLocation(window: BrowserWindow) {
	const result = await dialog.showOpenDialog(window, {
		// todo: translation?
		title: "Select Vault Location",
		buttonLabel: "Select Location",
		properties: ["openDirectory", "createDirectory"]
	})
	if (result.filePaths[0]) {
		return result.filePaths[0]
	}

	return null;
}

export async function createVault(dataPath: string, createVaultDto: CreateVaultDto) {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)
	const vaults = await queryVaults(dataPath)

	const id = randomUUID()
	const timestamp = new Date().toISOString()

	// todo: validate path, such as restricting access to system folders etc
	const newVault: VaultDto = {
		id: id,
		displayName: createVaultDto.displayName,
		path: createVaultDto.path,
		createdAt: timestamp,
		updatedAt: timestamp,
	}
	vaults.push(newVault)

	const contents = JSON.stringify(vaults)
	await writeFile(vaultsFilePath, contents)

	return newVault
}

export async function updateVault(dataPath: string, vaultId: string, updateVaultDto: UpdateVaultDto) {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)
	const vaults = await queryVaults(dataPath)

	let updatedVault: VaultDto | null = null
	const newVaults: VaultDto[] = []
	for (const existingVault of vaults) {
		if (existingVault.id === vaultId) {
			const newVault = {
				...existingVault,
				...updateVaultDto
			}
			newVaults.push(newVault)
			updatedVault = newVault
		}
		else {
			newVaults.push(existingVault)
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

export async function queryVaults(dataPath: string): Promise<VaultList> {
	const vaultsFilePath = join(dataPath, VAULTS_FILE)

	try {
		const contents = await readFile(vaultsFilePath, { encoding: 'utf8' })
		const data = JSON.parse(contents)
		return VaultList.parseAsync(data)
	} catch (error) {
		if (error instanceof ZodError) {
			console.debug('[vaults] Vault file corrupted/invalid')
		}
		else {
			console.debug(`[vaults] vault file not found (${error})`)
		}
	}

	return []
}
