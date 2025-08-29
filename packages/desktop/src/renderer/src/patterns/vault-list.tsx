import {useTranslation} from "react-i18next";
import {useVaults} from "@renderer/modules/vaults/use-vaults";

export function VaultList() {
	const { t } = useTranslation()
	const {
		vaults, isVaultsLoading,
		currentVault, isCurrentVaultLoading,
		openVault, openVaultNewWindow
	} = useVaults()

	if (isVaultsLoading || isCurrentVaultLoading) {
		return (
			<p>{t("Loading...")}</p>
		)
	}

	const vaultsList = Object.entries(vaults)
		.map(([, vault]) => vault)
		.sort((a, b) => (a.displayName > b.displayName ? 1 : -1))

	if (vaultsList.length === 0) {
		return (
			<p>{t("No vaults found")}</p>
		)
	}

	return (
		<div>
			{currentVault
				? <p>Current vault: {currentVault.displayName}</p>
				: <p>No open vault</p>
			}
			<ul>
				{vaultsList.map((vault) => (
					<li key={vault.id}>
						<h3>{vault.displayName}</h3>
						<button onClick={() => {openVault(vault.id)}}>open</button>
						<button onClick={() => {openVaultNewWindow(vault.id)}}>open in new window</button>
					</li>
				))}
			</ul>
		</div>
	)
}
