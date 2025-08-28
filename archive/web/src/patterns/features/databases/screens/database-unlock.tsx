import {useCallback} from "react";
import {DatabaseUnlockForm} from "../forms/database-unlock-form";
import {useDatabaseManagerDialogContext} from "../manager/database-manager-context";

export interface DatabaseUnlockScreenProps {
	databaseId: string
}

export function DatabaseUnlockScreen(props: DatabaseUnlockScreenProps) {
	const { setOpenTab } = useDatabaseManagerDialogContext()

	const onSuccess = useCallback(async () => {
		setOpenTab()
	}, [])

	return (
		<DatabaseUnlockForm
			databaseId={props.databaseId}
			onSuccess={onSuccess}
		/>
	)
}
