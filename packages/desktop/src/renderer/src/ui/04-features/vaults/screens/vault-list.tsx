import {useCallback} from "react";
import {useVaultManagerDialogContext} from "../manager/vault-manager-context";
import {ErrorCallout} from "@ui/02-components/error-callout/error-callout";
import {Button} from "@ui/01-atoms/button/button";
import {LiveQueryStatus} from "@contracts/query";
import {useCurrentVault} from "@framework/hooks/use-current-vault";
import {useDependency} from "@framework/dependency.context";
import { useVaults } from "@framework/hooks/use-vaults";


export function VaultListScreen() {
	const { setOpenTab, close } = useVaultManagerDialogContext()
	const { currentVaultApi } = useDependency()
	const currentVaultQuery = useCurrentVault()
	const currentVault = currentVaultQuery.status === LiveQueryStatus.SUCCESS ? currentVaultQuery.result : undefined
	const vaultsQuery = useVaults()

	//const { tabs } = useWorkspaceContext()
	//const workspaceHasUnsavedChanges = tabs.filter(tab => tab.isUnsaved).length > 0
	const workspaceHasUnsavedChanges = false

	const attemptOpenVault = useCallback(async (vaultId: string) => {
		// if (!vault.isUnlocked) {
		// 	setOpenTab({type: 'unlock', vaultId: vault.id})
		// 	return
		// }
		try {
			await currentVaultApi.open(vaultId)
			close()
			//const encryptionKey = await vaultsService.keyValueStore.get(`enckey_${vault.id}`, z.string())
			// if (encryptionKey) {
			// 	vaultsService.openVault(vault.id)
			// 	close()
			// }
		}
		catch (e) {
			console.error(e)
		}
	}, [close, currentVaultApi])

	const attemptOpenNewWindowVault = useCallback(async (vaultId: string) => {
		try {
			await currentVaultApi.openNewWindow(vaultId)
			close()
		}
		catch (e) {
			console.error(e)
		}
	}, [close, currentVaultApi])

	const attemptCloseVault = useCallback(async () => {
		try {
			currentVaultApi.close()
			close()
		}
		catch (e) {
			console.error(e)
		}
	}, [close, currentVaultApi])

	let content;
	if (vaultsQuery.status === LiveQueryStatus.LOADING) {
		content = <p>Loading...</p>
	}
	else if (vaultsQuery.status === LiveQueryStatus.ERROR) {
		content = <ErrorCallout errors={vaultsQuery.errors} />
	}
	else {
		content = (
			<>
				{vaultsQuery.errors && <ErrorCallout errors={vaultsQuery.errors} />}
				<div>
					{vaultsQuery.result.length === 0 && (
						<p>No Vaults Found</p>
					)}
					{vaultsQuery.result.map(vault => (
						<div key={vault.id} className="flex gap-4 items-center">
							<div>
								<h2 className='font-bold'>{vault.displayName}{currentVault?.id === vault.id && <span> [currently open]</span>}</h2>
								<p className="text-sm italic">{vault.path}</p>
								<div className='flex gap-2'>
									{/*{vault.syncEnabled && <p className="text-sm">Sync enabled</p>}*/}
									{/*{vault.lastSyncedAt*/}
									{/*	? <p className="text-sm">Last synced at: {vault.lastSyncedAt}</p>*/}
									{/*	: <p className="text-sm">Vault not synced</p>*/}
									{/*}*/}
								</div>
							</div>
							<div className='flex gap-2'>
								<Button
									variant='tertiary'
									onClick={() => {
										setOpenTab({type: 'edit', vaultId: vault.id})
									}}
								>Edit</Button>
								{/*{vault.isUnlocked && (*/}
								{/*	<JButton*/}
								{/*		variant='tertiary'*/}
								{/*		onClick={async () => {*/}
								{/*			if (!headbase) throw new Error("Headbase not found")*/}
								{/*			await headbase.vaults.lock(vault.id)*/}
								{/*		}}*/}
								{/*	>Lock</JButton>*/}
								{/*)}*/}
								{currentVault?.id !== vault.id && (
									<>
										<Button
											variant='tertiary'
											onClick={() => {
												attemptOpenVault(vault.id)
											}}
										>Open</Button>
										<Button
											variant='tertiary'
											onClick={() => {
												attemptOpenNewWindowVault(vault.id)
											}}
										>Open in new window</Button>
									</>
								)}
								{currentVault?.id === vault.id && (
									<Button
										variant='tertiary'
										onClick={() => {
											attemptCloseVault()
										}}
									>Close</Button>
								)}
							</div>
							</div>
					))}
				</div>
			</>
		)
	}

	return (
		<div>
			{/*{workspaceHasUnsavedChanges && (*/}
			{/*	<JCallout variant='warning'>You have unsaved changes that will be lost if you switch vaults now.</JCallout>*/}
			{/*)}*/}
			<Button
				onClick={() => {
					setOpenTab({type: 'create'})
				}}
			>Create</Button>
			{content}
		</div>
	)
}
