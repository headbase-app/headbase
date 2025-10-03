import {PropsWithChildren, ReactNode, useCallback, useEffect, useRef, useState} from "react";
import {VaultListScreen} from "../screens/vault-list";
import {VaultCreateScreen} from "../screens/vault-create";
import { VaultEditScreen } from "../screens/vault-edit";
import {_VaultDialogContext, VaultManagerTabs, useVaultManagerDialogContext} from "./vault-manager-context";
import {VaultServerList} from "../screens/vault-server-list";
import {Button} from "@ui/01-atoms/button/button";
import {Dialog} from "@ui/02-components/dialog/dialog";
import {useCurrentVault} from "@framework/hooks/use-current-vault";
import {useDependency} from "@framework/dependency.context";
import {LiveQueryStatus} from "@contracts/query";

export function VaultManagerDialogProvider(props: PropsWithChildren) {
	const [openTab, _setOpenTab] = useState<VaultManagerTabs|undefined>(undefined)

	const setOpenTab = useCallback((tab?: VaultManagerTabs) => {
		_setOpenTab(tab ?? {type: 'list'})
	}, [])

	const close = useCallback(() => {
		_setOpenTab(undefined)
	}, [])

	return (
		<_VaultDialogContext.Provider
			value={{
				openTab: openTab,
				setOpenTab,
				close
			}}
		>
			{props.children}
		</_VaultDialogContext.Provider>
	)
}


export function VaultManagerDialog() {
	const { openTab, setOpenTab, close } = useVaultManagerDialogContext()
	//const { closeAllTabs } = useWorkspaceContext()
	const currentVaultQuery = useCurrentVault()
	const { vaultsApi } = useDependency()
	// const currentUser = useCurrentUser()
	const currentUser = null

	let dialogContent: ReactNode
	switch (openTab?.type) {
		case "list": {
			dialogContent = <VaultListScreen />
			break;
		}
		case "list-server": {
			dialogContent = <VaultServerList />
			break;
		}
		case "create": {
			dialogContent = <VaultCreateScreen />
			break;
		}
		case "edit": {
			dialogContent = <VaultEditScreen vaultId={openTab.vaultId} />
			break;
		}
		// case "unlock": {
		// 	dialogContent = <VaultUnlockScreen vaultId={openTab.vaultId} />
		// 	break;
		// }
		default: (
			dialogContent = <p>No Open Tab</p>
		)
	}

	// Keep the vault manager open if there is no current vault
	const isFirstOpen = useRef(true)
	useEffect(() => {
		async function handleVaultChange() {
			if (currentVaultQuery.status === LiveQueryStatus.SUCCESS) {
				if (isFirstOpen.current) {
					isFirstOpen.current = false
					try {
						// ensure the vault exists and is unlocked before opening
						// todo: refactor local vault to return encryptionKey not isUnlocked?
						// const vault = await headbase.vaults.get(lastOpenedVaultId)
						// const encryptionKey = await headbase.keyValueStore.get(`enckey_${lastOpenedVaultId}`, z.string())

						// if (vault.isUnlocked && encryptionKey) {
						// 	setCurrentVaultId(lastOpenedVaultId)
						// }
					}
					catch (e) {
						console.error('Error attempting to open last opened vault')
						console.error(e)
					}
					setOpenTab({type: 'list'})
				}
			}
		}
		handleVaultChange()
	}, [vaultsApi, currentVaultQuery, setOpenTab])

	// useEffect(() => {
	// 	if (currentVaultId && currentUser.status === 'success' && currentUser.result) {
	// 		const interval = setInterval(() => {
	// 			headbase.sync.requestSync(currentVaultId)
	// 		}, 60000)
	//
	// 		return () => {
	// 			clearInterval(interval)
	// 		}
	// 	}
	// }, [currentVaultId, currentUser.status]);

	return (
		<Dialog
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
			disableOutsideClose={true}
			title="Manage vaults"
			description="Manage your current vaults"
			content={
				<div>
					<div className='flex gap-2'>
						<Button variant='secondary' onClick={() => {setOpenTab({type: "list"})}}>Local</Button>
						<Button variant='secondary' onClick={() => {setOpenTab({type: "list-server"})}}>Server</Button>
					</div>
					{dialogContent}
				</div>
			}
		/>
	)
}
