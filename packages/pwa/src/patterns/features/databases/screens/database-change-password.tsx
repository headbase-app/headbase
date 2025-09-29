import {useCallback} from "react";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";
import {DatabaseChangePasswordForm} from "../forms/database-change-password-form";
import {JArrowButton} from "@ben-ryder/jigsaw-react";
import {useVault} from "../../../../headbase/hooks/vaults/use-vault.tsx";
import {LiveQueryStatus} from "../../../../headbase/control-flow.ts";

export interface DatabaseChangePasswordScreenProps {
	databaseId: string
}

export function DatabaseChangePasswordScreen(props: DatabaseChangePasswordScreenProps) {
	const { setOpenTab } = useDatabaseManagerDialogContext()

	const onSuccess = useCallback(async () => {
		setOpenTab()
	}, [])

	const databaseQuery = useVault(props.databaseId)

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
