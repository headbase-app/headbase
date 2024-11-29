import {useCallback} from "react";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";
import {DatabaseChangePasswordForm} from "../forms/database-change-password-form";
import {JArrowButton} from "@ben-ryder/jigsaw-react";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";
import {useDatabase} from "@headbase-toolkit/react/use-database";

export interface DatabaseChangePasswordScreenProps {
	databaseId: string
}

export function DatabaseChangePasswordScreen(props: DatabaseChangePasswordScreenProps) {
	const { setOpenTab } = useDatabaseManagerDialogContext()

	const onSuccess = useCallback(async () => {
		setOpenTab()
	}, [])

	const databaseQuery = useDatabase(props.databaseId)

	return (
		<>
			<JArrowButton
				direction='left'
				onClick={() => {setOpenTab({type: 'list'})}}
			>All databases</JArrowButton>
			{databaseQuery.status === LiveQueryStatus.SUCCESS && (
				<p>Change password for {databaseQuery.result.name} database</p>
			)}
			<DatabaseChangePasswordForm
				databaseId={props.databaseId}
				onSuccess={onSuccess}
			/>
		</>
	)
}
