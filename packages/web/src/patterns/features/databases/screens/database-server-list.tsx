import {useCallback, useEffect, useState} from "react";
import {useWorkspaceContext} from "../../workspace/workspace-context";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";
import {useHeadbase} from "../../../../logic/react/use-headbase.tsx";
import {VaultDto} from "@headbase-app/common";
import {JButton} from "@ben-ryder/jigsaw-react";


export function DatabaseServerList() {
	const { headbase } = useHeadbase()
	const { setOpenTab } = useDatabaseManagerDialogContext();
	const [localVaultIds, setLocalVaultIds] = useState<string[]>([])
	const [vaults, setVaults] = useState<VaultDto[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		async function loadVaults() {
			if (!headbase) return;
			const localVaults = await headbase.databases.query()
			setLocalVaultIds(localVaults.result.map(v => v.id))
			const serverVaults = await headbase.server.getVaults()
			setVaults(serverVaults)
			setIsLoading(false)
		}
		loadVaults()
	}, [headbase])

	const deleteVault = useCallback(async (vaultId: string) => {
		if (!headbase) return;
		await headbase.server.deleteVault(vaultId)
	}, [headbase])

	const downloadAndSync = useCallback(async (vaultId: string) => {
		if (!headbase) return;
		await headbase.sync.downloadAndSync(vaultId)
		setOpenTab({type: "list"})
	}, [headbase, setOpenTab])

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
							<JButton onClick={() => {downloadAndSync(v.id)}}>Download & Sync</JButton>
							<JButton variant='destructive' onClick={() => {deleteVault(v.id)}}>Delete</JButton>
						</>)}
				</div>
			))}
		</div>
	)
}