import {VaultBasicDataForm} from "../forms/vault-basic-data-form";
import {useCallback} from "react";
import {useVaultManagerDialogContext} from "../manager/vault-manager-context";
import {Button} from "@ui/01-atoms/button/button";
import {ErrorCallout} from "@ui/02-components/error-callout/error-callout";
import {CreateVaultDto} from "@/contracts/vaults";
import {useDependency} from "@framework/dependency.context";
import {useVault} from "@framework/hooks/use-vault";
import {LiveQueryStatus} from "@contracts/query";

export interface VaultEditScreenProps {
	vaultId: string
}

export function VaultEditScreen(props: VaultEditScreenProps) {
	const { setOpenTab } = useVaultManagerDialogContext()
	const { vaultsApi } = useDependency()

	const onSave = useCallback(async (basicInfo: CreateVaultDto) => {
		try {
			await vaultsApi.update(
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

	}, [props.vaultId, setOpenTab, vaultsApi])

	const onDelete = useCallback(async () => {
		try {
			await vaultsApi.delete(props.vaultId)
			setOpenTab()
		}
		catch (e) {
			console.error(e)
		}
	}, [props.vaultId, setOpenTab, vaultsApi])

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

	if (vaultQuery.status === LiveQueryStatus.LOADING) {
		return (
			<p>Loading...</p>
		)
	}

	if (vaultQuery.status === LiveQueryStatus.ERROR) {
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
