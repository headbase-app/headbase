import {DatabaseBasicDataForm} from "../forms/database-basic-data-form";
import {useCallback} from "react";
import {LocalDatabaseFields} from "@headbase-toolkit/types/database";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {JArrowButton, JButton} from "@ben-ryder/jigsaw-react";
import { useObservableQuery } from "@headbase-toolkit/react/use-observable-query";
import { ErrorCallout } from "../../../patterns/components/error-callout/error-callout";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";

export interface DatabaseEditScreenProps {
	databaseId: string
}

export function DatabaseEditScreen(props: DatabaseEditScreenProps) {
	const { setOpenTab } = useDatabaseManagerDialogContext()

	const {
		currentDatabase,
		currentDatabaseDto,
		lockDatabase,
		updateDatabase,
		deleteLocalDatabase,
		deleteDatabase,
		liveGetDatabase,
	} = useHeadbase()

	const onSave = useCallback(async (basicInfo: LocalDatabaseFields) => {
		try {
			await updateDatabase(
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

	}, [updateDatabase])

	const onDelete = useCallback(async () => {
		try {
			await deleteDatabase(props.databaseId)
			setOpenTab()
		}
		catch (e) {
			console.error(e)
		}
	}, [currentDatabase])

	const onLocalDelete = useCallback(async () => {
		try {
			await deleteLocalDatabase(props.databaseId)
			setOpenTab()
		}
		catch (e) {
			console.error(e)
		}
	}, [currentDatabase])

	const onLock = useCallback(async () => {
		try {
			await lockDatabase(props.databaseId)
			setOpenTab()
		}
		catch (e) {
			console.error(e)
		}
	}, [])

	const databaseQuery = useObservableQuery(liveGetDatabase(props.databaseId))

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
				onClick={() => {
					setOpenTab({type: 'change-password', databaseId: props.databaseId})
				}}
			>Change password</JButton>
			{currentDatabaseDto?.isUnlocked && (
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
					syncEnabled: databaseQuery.result.syncEnabled
				}}
				extraButtons={
					<>
						<JButton
							type="button"
							variant="secondary"
							onClick={() => {
								onLocalDelete()
							}}
						>Delete Locally</JButton>
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