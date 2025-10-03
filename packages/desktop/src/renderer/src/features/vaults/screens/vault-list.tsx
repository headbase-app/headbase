import {useCallback} from "react";
import {useVaultManagerDialogContext} from "../manager/vault-manager-context";
import {useVaultsService} from "@renderer/services/vaults/vaults.context";
import {useCurrentVault, useVaults} from "@renderer/services/vaults/vaults.hooks";
import {ErrorCallout} from "@renderer/patterns/components/error-callout/error-callout";
import {SubscriptionResultStatus} from "@renderer/utils/subscriptions";
import {Button} from "@renderer/patterns/atoms/button/button";


export function VaultListScreen() {
	const { setOpenTab, close } = useVaultManagerDialogContext()
	const { vaultsService } = useVaultsService()
	const currentVaultQuery = useCurrentVault()
	const currentVault = currentVaultQuery.status === SubscriptionResultStatus.SUCCESS ? currentVaultQuery.result : undefined

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
			await vaultsService.openVault(vaultId)
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
	}, [close, vaultsService])

	const attemptOpenNewWindowVault = useCallback(async (vaultId: string) => {
		try {
			await vaultsService.openVaultNewWindow(vaultId)
			close()
		}
		catch (e) {
			console.error(e)
		}
	}, [close, vaultsService])

	const attemptCloseVault = useCallback(async () => {
		try {
			vaultsService.closeCurrentVault()
			close()
		}
		catch (e) {
			console.error(e)
		}
	}, [close, vaultsService])

	let content;
	if (vaultsQuery.status === SubscriptionResultStatus.LOADING) {
		content = <p>Loading...</p>
	}
	else if (vaultsQuery.status === SubscriptionResultStatus.ERROR) {
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
