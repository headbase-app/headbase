import {useEffect, useState} from "react";
import {Vault} from "../../../contracts/vaults";
import {useTranslation} from "react-i18next";

export function VaultList() {
	const { t } = useTranslation()

	const [isLoading, setIsLoading] = useState(true)
	const [openVault, setOpenVault] = useState<string | null>(null)
	const [vaults, setVaults] = useState<Vault[]>([])

	useEffect(() => {
		async function load() {
			const loadedOpenVault = await window.platformAPI.getOpenVault()
			if (!loadedOpenVault.error) {
				setOpenVault(loadedOpenVault.result)
			}

			const loadedVaults = await window.platformAPI.getVaults()
			if (!loadedVaults.error) {
				setVaults(loadedVaults.result)
			}
			setIsLoading(false)
		}
		load()
	}, [])

	async function switchVault(vaultId: string) {
		const result = await window.platformAPI.switchVault(vaultId)
		if (!result.error) {
			setOpenVault(vaultId)
		}
	}

	async function openVaultWindow(vaultId: string) {
		await window.platformAPI.openVaultWindow(vaultId)
	}

	if (isLoading) {
		return (
			<p>{t("Loading...")}</p>
		)
	}

	if (vaults.length === 0) {
		return (
			<p>{t("No vaults found...")}</p>
		)
	}

	return (
		<div>
			{openVault
				? <p>Open vault: {openVault}</p>
				: <p>No open vault</p>
			}
			<ul>
				{vaults.map((vault) => (
					<li key={vault.id}>
						<h3>{vault.displayName}</h3>
						<button onClick={() => {switchVault(vault.id)}}>switch to vault</button>
						<button onClick={() => {openVaultWindow(vault.id)}}>open in new window</button>
					</li>
				))}
			</ul>
		</div>
	)
}
