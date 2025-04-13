import {JButton, JCallout} from "@ben-ryder/jigsaw-react";
import {useCallback} from "react";
import {useWorkspaceContext} from "../../workspace/workspace-context";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";
import {useHeadbase} from "../../../../logic/react/use-headbase.tsx";
import {useDatabases} from "../../../../logic/react/databases/use-databases.tsx";
import {LocalDatabaseDto} from "../../../../logic/schemas/database.ts";
import {LiveQueryStatus} from "../../../../logic/control-flow.ts";
import {ErrorCallout} from "../../../components/error-callout/error-callout.tsx";
import {KeyStorageService} from "../../../../logic/services/key-storage/key-storage.service.ts";

export function DatabaseListScreen() {
	const { setOpenTab, close } = useDatabaseManagerDialogContext()
	const { headbase, setCurrentDatabaseId, currentDatabaseId } = useHeadbase()
	const databasesQuery = useDatabases()

	const { tabs } = useWorkspaceContext()
	const workspaceHasUnsavedChanges = tabs.filter(tab => tab.isUnsaved).length > 0

	const attemptOpenDatabase = useCallback(async (database: LocalDatabaseDto) => {
		if (!headbase) return

		if (!database.isUnlocked) {
			setOpenTab({type: 'unlock', databaseId: database.id})
			return
		}

		try {
			const encryptionKey = await KeyStorageService.get(database.id)
			if (encryptionKey) {
				await headbase.db.open(database.id, encryptionKey)
				setCurrentDatabaseId(database.id)
				close()
			}
		}
		catch (e) {
			console.error(e)
		}
	}, [headbase])

	let content;
	if (databasesQuery.status === LiveQueryStatus.LOADING) {
		content = <p>Loading...</p>
	}
	else if (databasesQuery.status === LiveQueryStatus.ERROR) {
		content = <ErrorCallout errors={databasesQuery.errors} />
	}
	else {
		content = (
			<>
				{databasesQuery.errors && <ErrorCallout errors={databasesQuery.errors} />}
				<div>
					{databasesQuery.result.length === 0 && (
						<p>No Databases Found</p>
					)}
					{databasesQuery.result.map(database => (
						<div key={database.id}>
							<h2>{database.name}{currentDatabaseId === database.id && <span> [currently open]</span>}</h2>
							{database.syncEnabled && <p>Sync enabled</p>}
							{database.lastSyncedAt
								? <p>Last synced at: {database.lastSyncedAt}</p>
								: <p>Database not synced</p>
							}
							<JButton
								variant='tertiary'
								onClick={() => {
									setOpenTab({type: 'edit', databaseId: database.id})
								}}
							>Edit</JButton>
							{database.isUnlocked && (
								<JButton
									variant='tertiary'
									onClick={async () => {
										if (!headbase) throw new Error("Headbase not found")
										await headbase.databases.lock(database.id)
									}}
								>Lock</JButton>
							)}
							{currentDatabaseId !== database.id && (
								<JButton
									variant='tertiary'
									onClick={() => {
										attemptOpenDatabase(database)
									}}
								>Open</JButton>
							)}
						</div>
					))}
				</div>
			</>
		)
	}

	return (
		<div>
			{workspaceHasUnsavedChanges && (
				<JCallout variant='warning'>You have unsaved changes that will be lost if you switch databases now.</JCallout>
			)}
			<JButton
				onClick={() => {
					setOpenTab({type: 'create'})
				}}
			>Create</JButton>
			{content}
		</div>
	)
}