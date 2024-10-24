import {JButton, JCallout} from "@ben-ryder/jigsaw-react";
import {useLocalful} from "@headbase-toolkit/react/use-localful";
import {useObservableQuery} from "@headbase-toolkit/react/use-observable-query";
import {ErrorCallout} from "../../../patterns/components/error-callout/error-callout";
import {useCallback} from "react";
import {LocalDatabaseDto} from "@headbase-toolkit/types/database";
import {useWorkspaceContext} from "../../workspace/workspace-context";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";


export function DatabaseListScreen() {
	const { setOpenTab, close } = useDatabaseManagerDialogContext()
	const { openDatabase, liveQueryDatabase, lockDatabase } = useLocalful()
	const databaseQuery = useObservableQuery(liveQueryDatabase())

	const { tabs } = useWorkspaceContext()
	const workspaceHasUnsavedChanges = tabs.filter(tab => tab.isUnsaved).length > 0

	const attemptOpenDatabase = useCallback(async (database: LocalDatabaseDto) => {
		if (!database.isUnlocked) {
			setOpenTab({type: 'unlock', databaseId: database.id})
			return
		}

		try {
			await openDatabase(database.id)
			close()
		}
		catch (e) {
			console.error(e)
		}
	}, [])

	let content;
	if (databaseQuery.status === LiveQueryStatus.LOADING) {
		content = <p>Loading...</p>
	}
	else if (databaseQuery.status === LiveQueryStatus.ERROR) {
		content = <ErrorCallout errors={databaseQuery.errors} />
	}
	else {
		content = (
			<>
				{databaseQuery.errors && <ErrorCallout errors={databaseQuery.errors} />}
				<div>
					{databaseQuery.result.length === 0 && (
						<p>No Databases Found</p>
					)}
					{databaseQuery.result.map(database => (
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
										await lockDatabase(database.id)
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