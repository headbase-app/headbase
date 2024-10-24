import {useCallback} from "react";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";
import {DatabaseChangePasswordForm} from "../forms/database-change-password-form";
import {JArrowButton} from "@ben-ryder/jigsaw-react";
import {useObservableQuery} from "@headbase-toolkit/react/use-observable-query";
import {useLocalful} from "@headbase-toolkit/react/use-localful";
import { LiveQueryStatus } from "@headbase-toolkit/control-flow";

export interface DatabaseChangePasswordScreenProps {
	databaseId: string
}

export function DatabaseChangePasswordScreen(props: DatabaseChangePasswordScreenProps) {
	const { liveGetDatabase } = useLocalful()
	const { setOpenTab } = useDatabaseManagerDialogContext()

	const onSuccess = useCallback(async () => {
		setOpenTab()
	}, [])

	const databaseQuery = useObservableQuery(liveGetDatabase(props.databaseId))

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
