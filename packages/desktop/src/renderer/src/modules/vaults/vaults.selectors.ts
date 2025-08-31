import {Vault, VaultMap} from "../../../../contracts/vaults";
import {useEffect, useState} from "react";
import {useVaultsService} from "@renderer/modules/vaults/vaults.context";

export interface UseVaults {
	vaults: VaultMap;
	isVaultsLoading: boolean
}

export function useVaults(): UseVaults {
	const { vaultsService } = useVaultsService()
	const [vaults, setVaults] = useState<VaultMap>({})
	const [isVaultsLoading, setIsVaultsLoading] = useState(true)

	useEffect(() => {
		async function load() {
			try {
				const result = await vaultsService.getVaults()
				setVaults(result)
			}
			catch (e) {
				// todo: how to handle error?
				console.error(e)
			}
			setIsVaultsLoading(false)
		}
		load()
	}, [vaultsService])

	return {vaults, isVaultsLoading}
}

export interface UseCurrentVault {
	currentVault: Vault | null;
	isCurrentVaultLoading: boolean;
}

export function useCurrentVault(): UseCurrentVault {
	const { vaultsService } = useVaultsService()
	const [currentVault, setCurrentVault] = useState<Vault|null>(null)
	const [isCurrentVaultLoading, setIsCurrentVaultLoading] = useState(true)

	useEffect(() => {
		async function load() {
			try {
				const result = await vaultsService.getCurrentVault()
				setCurrentVault(result)
			}
			catch (e) {
				// todo: how to handle error?
				console.error(e)
			}
			setIsCurrentVaultLoading(false)
		}
		load()
	}, [vaultsService])

	return {currentVault, isCurrentVaultLoading}
}

export interface UseVault {
	vault: Vault | null;
	isVaultLoading: boolean;
}

export function useVault(vaultId: string): UseVault {
	const { vaultsService } = useVaultsService()
	const [vault, setVault] = useState<Vault | null>(null)
	const [isVaultLoading, setIsVaultLoading] = useState(true)

	useEffect(() => {
		async function load() {
			try {
				const result = await vaultsService.getVault(vaultId)
				setVault(result)
			}
			catch (e) {
				// todo: how to handle error?
				console.error(e)
			}
			setIsVaultLoading(false)
		}
		load()
	}, [vaultId, vaultsService])

	return {vault, isVaultLoading}
}
