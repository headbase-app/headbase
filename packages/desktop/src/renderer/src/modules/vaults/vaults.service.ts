import {IVaultsService} from "@renderer/modules/vaults/vaults.interface";
import {Vault, VaultMap} from "../../../../contracts/vaults";

export class WebVaultsService implements IVaultsService {
	async getCurrentVault(): Promise<Vault | null> {
		const result = await window.platformAPI.getCurrentVault()
		if (result.error) {
			throw result
		}

		return result.result;
	}

	async getVaults(): Promise<VaultMap> {
		const result = await window.platformAPI.getVaults()
		if (result.error) {
			throw result
		}

		return result.result;
	}

	async openVault(vaultId: string) {
		const result = await window.platformAPI.openVault(vaultId)
		if (result.error) {
			throw result
		}

		return result.result;
	}

	async openVaultNewWindow(vaultId: string) {
		const result = await window.platformAPI.openVaultNewWindow(vaultId)
		if (result.error) {
			throw result
		}

		return result.result;
	}

	async getVault(vaultId: string): Promise<Vault | null> {
		const result = await window.platformAPI.getVault(vaultId)
		if (result.error) {
			throw result
		}

		return result.result;
	}
}
