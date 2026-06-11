import {createContext} from "./context.ts";

import type {IDeviceAPI} from "../02-apis/device/device.api.ts";
import type {IFilesAPI} from "../02-apis/files/files.api.ts";
import type {IVaultsAPI} from "../02-apis/vaults/vaults.api.ts";
import type {IWorkspaceVaultAPI} from "../02-apis/workspace-vault/workspace-vault.api.ts";
import {IPluginStore} from "../02-apis/plugin/plugin.api.ts";
import {IWorkspaceAPI} from "../02-apis/workspace/workspace.api.ts";

export const DeviceAPIContext = createContext<IDeviceAPI>('IDeviceAPI');
export const FilesAPIContext = createContext<IFilesAPI>('IFilesAPI');
export const VaultsAPIContext = createContext<IVaultsAPI>('IVaultsAPI');
export const WorkspaceVaultAPIContext = createContext<IWorkspaceVaultAPI>('IWorkspaceVaultAPI');

export const PluginAPIContext = createContext<IPluginStore>('IPluginStore');

export const WorkspaceAPIContext = createContext<IWorkspaceAPI>('IWorkspaceAPI');
