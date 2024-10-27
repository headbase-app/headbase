import {JButton, JCallout} from "@ben-ryder/jigsaw-react";
import {useHeadbase} from "@headbase-toolkit/react/use-headbase";
import {ErrorCallout} from "../../../patterns/components/error-callout/error-callout";
import {useCallback} from "react";
import {LocalDatabaseDto} from "@headbase-toolkit/types/database";
import {useWorkspaceContext} from "../../workspace/workspace-context";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";
import {useDatabases} from "@headbase-toolkit/react/use-databases";


export function DatabaseListScreen() {
	const { setOpenTab, close } = useDatabaseManagerDialogContext()
	const { headbase, setCurrentDatabaseId } = useHeadbase()
	const databasesQuery = useDatabases()

	const { tabs } = useWorkspaceContext()
	const workspaceHasUnsavedChanges = tabs.filter(tab => tab.isUnsaved).length > 0

	const attemptOpenDatabase = useCallback(async (database: LocalDatabaseDto) => {
		if (!database.isUnlocked) {
			setOpenTab({type: 'unlock', databaseId: database.id})
			return
		}

		try {
			setCurrentDatabaseId(database.id)
			close()
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
							<h2>{database.name}</h2>
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
							<JButton
								variant='tertiary'
								onClick={() => {
									attemptOpenDatabase(database)
								}}
							>Open</JButton>
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