import {useCallback, useEffect, useState} from "react";
import {useVaultManagerDialogContext} from "../manager/vault-manager-context";
import {useVaultsService} from "@renderer/services/vaults/vaults.context";
import {Button} from "@renderer/patterns/atoms/button/button";

export function VaultServerList() {
	const { vaultsService } = useVaultsService()
	const { setOpenTab } = useVaultManagerDialogContext();
	const [localVaultIds, setLocalVaultIds] = useState<string[]>([])
	const [vaults, setVaults] = useState<VaultDto[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		async function loadVaults() {
			const localVaults = await vaultsService.getVaults()
			setLocalVaultIds(localVaults.map(v => v.id))
			//const serverVaults = await headbase.server.getVaults()
			//setVaults(serverVaults)
			setIsLoading(false)
		}
		loadVaults()
	}, [vaultsService])

	const deleteVault = useCallback(async (vaultId: string) => {
		await vaultsService.deleteVault(vaultId)
	}, [vaultsService])

	const downloadAndSync = useCallback(async (vaultId: string) => {
		// await vaultsService.downloadAndSync(vaultId)
		setOpenTab({type: "list"})
	}, [vaultsService, setOpenTab])

	return (
		<div>
			<p>When deleting a vault, ensure you remove it or disable sync on all devices to stop it being created again!</p>
			{isLoading && <p>Loading...</p>}
			{vaults.map((v) => (
				<div key={v.id}>
					<h3>{v.name}</h3>
					{localVaultIds.includes(v.id)
						? (
						<p>Syncing with local vault. Manage via "local" vaults tab.</p>
						)
					: (
						<>
							<Button onClick={() => {downloadAndSync(v.id)}}>Download & Sync</Button>
							<Button variant='destructive' onClick={() => {deleteVault(v.id)}}>Delete</Button>
						</>)}
				</div>
			))}
		</div>
	)
}
