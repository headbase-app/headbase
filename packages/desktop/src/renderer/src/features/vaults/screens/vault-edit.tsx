import {VaultBasicDataForm} from "../forms/vault-basic-data-form";
import {useCallback} from "react";
import {useVaultManagerDialogContext} from "../manager/vault-manager-context";
import {useVaultsService} from "@renderer/services/vaults/vaults.context";
import {useVault} from "@renderer/services/vaults/vaults.hooks";
import {Button} from "@renderer/patterns/atoms/button/button";
import {ErrorCallout} from "@renderer/patterns/components/error-callout/error-callout";
import {SubscriptionResultStatus} from "@renderer/utils/subscriptions";
import {CreateVaultDto} from "@/contracts/vaults";


export interface VaultEditScreenProps {
	vaultId: string
}


export function VaultEditScreen(props: VaultEditScreenProps) {
	const { setOpenTab } = useVaultManagerDialogContext()
	const { vaultsService } = useVaultsService()

	const onSave = useCallback(async (basicInfo: CreateVaultDto) => {
		try {
			await vaultsService.updateVault(
				props.vaultId,
				{
					displayName: basicInfo.displayName,
					path: basicInfo.path
				}
			)
			setOpenTab()
		}
		catch (e) {
			console.error(e)
		}

	}, [props.vaultId, setOpenTab, vaultsService])

	const onDelete = useCallback(async () => {
		try {
			await vaultsService.deleteVault(props.vaultId)
			setOpenTab()
		}
		catch (e) {
			console.error(e)
		}
	}, [props.vaultId, setOpenTab, vaultsService])

	const onLock = useCallback(async () => {
		try {
			///await vaultsService.lockVault(props.vaultId)
			setOpenTab()
		}
		catch (e) {
			console.error(e)
		}
	}, [setOpenTab])

	const vaultQuery = useVault(props.vaultId)

	if (vaultQuery.status === SubscriptionResultStatus.LOADING) {
		return (
			<p>Loading...</p>
		)
	}

	if (vaultQuery.status === SubscriptionResultStatus.ERROR) {
		return (
			<ErrorCallout errors={vaultQuery.errors} />
		)
	}

	// todo: is this really needed, can rely on looser typing?
	if (!vaultQuery.result) {
		return (
			<p>Vault not found</p>
		)
	}

	return (
		<div>
			<Button
				onClick={() => {setOpenTab({type: 'list'})}}
			>All vaults</Button>
			<h2>Edit Vault {vaultQuery.result?.displayName}</h2>
			{/*{!vaultQuery.result.isUnlocked && <p>Unable to import/export vault until it is unlocked.</p>}*/}
			{/*<Button*/}
			{/*	variant='secondary'*/}
			{/*>Change password</Button>*/}
			{/*<Button*/}
			{/*	variant='secondary'*/}
			{/*	onClick={async () => {*/}
			{/*		await onLock()*/}
			{/*	}}*/}
			{/*>Lock</Button>*/}

			<VaultBasicDataForm
				saveText='Save'
				onSave={onSave}
				initialData={{
					displayName: vaultQuery.result?.displayName,
					path: vaultQuery.result?.path,
				}}
				extraButtons={
					<>
						<Button
							type="button"
							variant="destructive"
							onClick={() => {
								onDelete()
							}}
						>Delete</Button>
					</>
				}
			/>
		</div>
	)
}
