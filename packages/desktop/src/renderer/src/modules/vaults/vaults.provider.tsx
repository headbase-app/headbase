import {type PropsWithChildren, useCallback, useEffect, useState} from "react";
import {VaultsContext} from "./vaults.context";
import {Vault, VaultMap} from "../../../../contracts/vaults";

export function VaultsProvider({children}: PropsWithChildren) {
	const [vaults, setVaults] = useState<VaultMap>({})
	const [isVaultsLoading, setIsVaultsLoading] = useState(true)

	const [currentVault, setCurrentVault] = useState<Vault|null>(null)
	const [isCurrentVaultLoading, setIsCurrentVaultLoading] = useState(true)

	const openVault = useCallback(async (vaultId: string) => {
		const result = await window.platformAPI.openVault(vaultId)
		if (!result.error) {
			setCurrentVault(vaults[vaultId])
		}
	}, [vaults])

	const openVaultNewWindow = useCallback(async (vaultId: string) => {
		const result = await window.platformAPI.openVaultNewWindow(vaultId)
		if (result.error) {
			console.error(result)
		}
	}, [])

	useEffect(() => {
		async function load() {
			const vaultsResult = await window.platformAPI.getVaults()
			if (!vaultsResult.error) {
				setVaults(vaultsResult.result)
			}
			else {
				// todo: how to handle error?
				console.error(vaultsResult)
			}

			setIsVaultsLoading(false)
		}
		load()
	}, [])

	useEffect(() => {
		async function load() {
			const currentVaultResult = await window.platformAPI.getCurrentVault()
			if (!currentVaultResult.error) {
				setCurrentVault(currentVaultResult.result)
			}
			else {
				// todo: how to handle error?
				console.error(currentVaultResult)
			}

			setIsCurrentVaultLoading(false)
		}
		load()
	}, [])

	const value: VaultsContext = {
		vaults, isVaultsLoading,
		currentVault, isCurrentVaultLoading,
		openVault, openVaultNewWindow
	}

	return (
		<VaultsContext.Provider value={value}>
			{children}
		</VaultsContext.Provider>
	)
}
