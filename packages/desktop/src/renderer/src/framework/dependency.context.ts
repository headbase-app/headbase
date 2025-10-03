import {createContext, useContext} from "react";
import {IVaultsAPI} from "@api/vaults/vaults.interface";
import {IEventsAPI} from "@api/events/events.interface";
import {IDeviceAPI} from "@api/device/device.interface";
import {ICurrentVaultAPI} from "@api/current-vault/current-vault.interface";
import {IFilesAPI} from "@api/files/files.interface";

export interface DependencyContext {
	eventsApi: IEventsAPI
	deviceApi: IDeviceAPI
	vaultsApi: IVaultsAPI
	currentVaultApi: ICurrentVaultAPI
	filesApi: IFilesAPI
}

// no default is provided, instantiation is dependent on using the provider and injection
export const DependencyContext = createContext<DependencyContext>({} as DependencyContext)

export const useDependency = () => useContext(DependencyContext)
