import {useCallback, useEffect, useState} from "react";
import {useVaultManagerDialogContext} from "../manager/vault-manager-context";
import {Button} from "@ui/01-atoms/button/button";
import {LocalVaultDto} from "@contracts/vaults";
import {useDependency} from "@framework/dependency.context";

export function VaultServerList() {
	const { vaultsApi } = useDependency()
	const { setOpenTab } = useVaultManagerDialogContext();
	const [localVaultIds, setLocalVaultIds] = useState<string[]>([])
	const [vaults, setVaults] = useState<LocalVaultDto[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		async function loadVaults() {
			const localVaults = await vaultsApi.query()
			setLocalVaultIds(localVaults.map(v => v.id))
			//const serverVaults = await headbase.server.getVaults()
			//setVaults(serverVaults)
			setIsLoading(false)
		}
		loadVaults()
	}, [vaultsApi])

	const deleteVault = useCallback(async (vaultId: string) => {
		await vaultsApi.delete(vaultId)
	}, [vaultsApi])

	const downloadAndSync = useCallback(async (vaultId: string) => {
		// await vaultsService.downloadAndSync(vaultId)
		setOpenTab({type: "list"})
	}, [vaultsApi, setOpenTab])

	return (
		<div>
			<p>When deleting a vault, ensure you remove it or disable sync on all devices to stop it being created again!</p>
			{isLoading && <p>Loading...</p>}
			{vaults.map((v) => (
				<div key={v.id}>
					<h3>{v.displayName}</h3>
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
