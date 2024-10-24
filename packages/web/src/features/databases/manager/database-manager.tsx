import React, {ReactNode, useCallback, useEffect, useRef, useState} from "react";
import {PropsWithChildren} from "../../../utils/children-prop";
import {JDialog} from "@ben-ryder/jigsaw-react";
import {DatabaseListScreen} from "../screens/database-list";
import {DatabaseCreateScreen} from "../screens/database-create";
import { useLocalful } from "@headbase-toolkit/react/use-localful";
import { DatabaseEditScreen } from "../screens/database-edit";
import {DatabaseUnlockScreen} from "../screens/database-unlock";
import {_DatabaseDialogContext, DatabaseManagerTabs, useDatabaseManagerDialogContext} from "./database-manager-context";
import {useWorkspaceContext} from "../../workspace/workspace-context";
import {DatabaseChangePasswordScreen} from "../screens/database-change-password";

export function DatabaseManagerDialogProvider(props: PropsWithChildren) {
	const [openTab, _setOpenTab] = useState<DatabaseManagerTabs|undefined>(undefined)

	const setOpenTab = useCallback((tab?: DatabaseManagerTabs) => {
		_setOpenTab(tab ?? {type: 'list'})
	}, [])

	const close = useCallback(() => {
		_setOpenTab(undefined)
	}, [])

	return (
		<_DatabaseDialogContext.Provider
			value={{
				openTab: openTab,
				setOpenTab,
				close
			}}
		>
			{props.children}
		</_DatabaseDialogContext.Provider>
	)
}


export function DatabaseManagerDialog() {
	const { openTab, setOpenTab, close } = useDatabaseManagerDialogContext()
	const { closeAllTabs } = useWorkspaceContext()

	const { currentDatabase, openDatabase } = useLocalful()

	let dialogContent: ReactNode
	switch (openTab?.type) {
		case "list": {
			dialogContent = <DatabaseListScreen />
			break;
		}
		case "create": {
			dialogContent = <DatabaseCreateScreen />
			break;
		}
		case "edit": {
			dialogContent = <DatabaseEditScreen databaseId={openTab.databaseId} />
			break;
		}
		case "change-password": {
			dialogContent = <DatabaseChangePasswordScreen databaseId={openTab.databaseId} />
			break;
		}
		case "unlock": {
			dialogContent = <DatabaseUnlockScreen databaseId={openTab.databaseId} />
			break;
		}
		default: (
			dialogContent = <p>No Open Tab</p>
		)
	}

	// Keep the database manager open if there is no current database
	const isFirstOpen = useRef(true)
	useEffect(() => {
		async function handleDatabaseChange() {
			if (currentDatabase) {
				localStorage.setItem('lf_lastOpenedDb', currentDatabase.databaseId)
				// todo: should this be managed in workspace not here?
				closeAllTabs()
				close()
			}
			else if (isFirstOpen.current) {
				isFirstOpen.current = false

				const lastOpenedDatabaseId = localStorage.getItem('lf_lastOpenedDb')
				if (lastOpenedDatabaseId) {
					const openDb = await openDatabase(lastOpenedDatabaseId)
					if (openDb) {
						return
					}
				}
				setOpenTab({type: 'list'})
			}
		}
		handleDatabaseChange()
	}, [currentDatabase])

	return (
		<JDialog
			isOpen={!!openTab}
			setIsOpen={(isOpen) => {
				if (isOpen) {
					setOpenTab(isOpen ? {type: 'list'} : undefined)
				}
				else {
					close()
				}
			}}
			role={openTab ? 'dialog' : 'alertdialog'}
			disableOutsideClose={!currentDatabase}
			title="Database Manager"
			description="Manage your current database"
			content={dialogContent}
		/>
	)
}
