import {useTranslation} from "react-i18next";
import {Vault, VaultMap} from "../../../contracts/vaults";
import {IVaultsService} from "@renderer/modules/vaults/vaults.interface";

export interface VaultListProps {
	vaults: VaultMap;
	isVaultsLoading: boolean;
	currentVault: Vault | null;
	isCurrentVaultLoading: boolean;
	openVault: IVaultsService['openVault'];
	openVaultNewWindow: IVaultsService['openVaultNewWindow'];
}

export function VaultList({vaults, isVaultsLoading, currentVault, isCurrentVaultLoading, openVault, openVaultNewWindow}: VaultListProps) {
	const { t } = useTranslation()

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
