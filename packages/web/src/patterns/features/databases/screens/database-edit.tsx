import {DatabaseBasicDataForm, DatabaseBasicFields} from "../forms/database-basic-data-form";
import {useCallback} from "react";
import {JArrowButton, JButton} from "@ben-ryder/jigsaw-react";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";
import {ErrorCallout} from "../../../components/error-callout/error-callout.tsx";
import {useHeadbase} from "../../../../headbase/hooks/use-headbase.tsx";
import {useVault} from "../../../../headbase/hooks/vaults/use-vault.tsx";
import {LiveQueryStatus} from "../../../../headbase/control-flow.ts";


export interface DatabaseEditScreenProps {
	databaseId: string
}


export function DatabaseEditScreen(props: DatabaseEditScreenProps) {
	const { setOpenTab } = useDatabaseManagerDialogContext()

	const {headbase} = useHeadbase()

	const onSave = useCallback(async (basicInfo: DatabaseBasicFields) => {
		if (!headbase) throw new Error("Headbase not found")

		try {
			await headbase.vaults.update(
				props.databaseId,
				{
					name: basicInfo.name,
					syncEnabled: basicInfo.syncEnabled
				}
			)
			setOpenTab()
		}
		catch (e) {
			console.error(e)
		}

	}, [headbase])

	const onDelete = useCallback(async () => {
		if (!headbase) throw new Error("Headbase not found")

		try {
			await headbase.vaults.delete(props.databaseId)
			setOpenTab()
		}
		catch (e) {
			console.error(e)
		}
	}, [headbase])

	const onLock = useCallback(async () => {
		if (!headbase) throw new Error("Headbase not found")

		try {
			await headbase.vaults.lock(props.databaseId)
			setOpenTab()
		}
		catch (e) {
			console.error(e)
		}
	}, [headbase])

	const databaseQuery = useVault(props.databaseId)

	if (databaseQuery.status === LiveQueryStatus.LOADING) {
		return (
			<p>Loading...</p>
		)
	}

	if (databaseQuery.status === LiveQueryStatus.ERROR) {
		return (
			<ErrorCallout errors={databaseQuery.errors} />
		)
	}

	return (
		<div>
			<JArrowButton
				direction='left'
				onClick={() => {setOpenTab({type: 'list'})}}
			>All databases</JArrowButton>
			<h2>Edit Database {databaseQuery.result.name}</h2>
			<JButton
				variant='secondary'
				disabled={!databaseQuery.result.isUnlocked}
				onClick={() => {
					setOpenTab({type: 'import', databaseId: props.databaseId})
				}}
			>Import</JButton>
			<JButton
				variant='secondary'
				disabled={!databaseQuery.result.isUnlocked}
				onClick={() => {
					setOpenTab({type: 'export', databaseId: props.databaseId})
				}}
			>Export</JButton>
			{!databaseQuery.result.isUnlocked && <p>Unable to import/export database until it is unlocked.</p>}
			<JButton
				variant='secondary'
				onClick={() => {
					setOpenTab({type: 'change-password', databaseId: props.databaseId})
				}}
			>Change password</JButton>
			{databaseQuery.result?.isUnlocked && (
				<JButton
					variant='secondary'
					onClick={async () => {
						await onLock()
					}}
				>Lock</JButton>
			)}
			<DatabaseBasicDataForm
				saveText='Save'
				onSave={onSave}
				initialData={{
					name: databaseQuery.result.name,
					syncEnabled: databaseQuery.result.syncEnabled,
				}}
				extraButtons={
					<>
						<JButton
							type="button"
							variant="destructive"
							onClick={() => {
								onDelete()
							}}
						>Delete</JButton>
					</>
				}
			/>
		</div>
	)
}