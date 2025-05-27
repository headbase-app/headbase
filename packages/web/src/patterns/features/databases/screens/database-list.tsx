import {JButton, JCallout} from "@ben-ryder/jigsaw-react";
import {useCallback} from "react";
import {useWorkspaceContext} from "../../workspace/workspace-context";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";
import {ErrorCallout} from "../../../components/error-callout/error-callout.tsx";
import {useVaults} from "../../../../headbase/hooks/vaults/use-vaults.tsx";
import {useHeadbase} from "../../../../headbase/hooks/use-headbase.tsx";
import {z} from "zod";
import {LiveQueryStatus} from "../../../../headbase/control-flow.ts";
import {LocalVaultDto} from "../../../../headbase/services/vault/local-vault.ts";


export function DatabaseListScreen() {
	const { setOpenTab, close } = useDatabaseManagerDialogContext()
	const { headbase, setCurrentDatabaseId, currentDatabaseId } = useHeadbase()
	const databasesQuery = useVaults()

	const { tabs } = useWorkspaceContext()
	const workspaceHasUnsavedChanges = tabs.filter(tab => tab.isUnsaved).length > 0

	const attemptOpenDatabase = useCallback(async (database: LocalVaultDto) => {
		if (!headbase) return

		if (!database.isUnlocked) {
			setOpenTab({type: 'unlock', databaseId: database.id})
			return
		}

		try {
			const encryptionKey = await headbase.keyValueStore.get(database.id, z.string())
			if (encryptionKey) {
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
							<h2 className='!font-bold'>{database.name}{currentDatabaseId === database.id && <span> [currently open]</span>}</h2>
							<div className='flex gap-2'>
								{database.syncEnabled && <p className="!text-sm">Sync enabled</p>}
								{database.lastSyncedAt
									? <p className="!text-sm">Last synced at: {database.lastSyncedAt}</p>
									: <p className="!text-sm">Database not synced</p>
								}
							</div>
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
										await headbase.vaults.lock(database.id)
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