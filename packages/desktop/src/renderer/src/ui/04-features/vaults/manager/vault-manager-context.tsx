import { createContext, useContext } from "react";

export type VaultManagerTabs = {
	type: 'list',
} | {
	type: 'list-server',
}| {
	type: 'create'
} | {
	type: 'edit'
	vaultId: string
}

export interface VaultManagerDialogContext {
	openTab?: VaultManagerTabs
	setOpenTab: (tab?: VaultManagerTabs) => void
	close: () => void
}

export const _VaultDialogContext = createContext<VaultManagerDialogContext|undefined>(undefined)

export function useVaultManagerDialogContext() {
	const vaultDialogContext = useContext(_VaultDialogContext)
	if (!vaultDialogContext) {
		throw new Error('Attempted to use vault dialog context outside provider.')
	}

	return vaultDialogContext
}
