import {createContext} from "./context.ts";

import type {IDeviceAPI} from "../02-apis/device/device.api.ts";
import type {IFilesAPI} from "../02-apis/files/files.api.ts";
import type {IVaultsAPI} from "../02-apis/vaults/vaults.api.ts";
import type {IWorkspaceVaultAPI} from "../02-apis/workspace-vault/workspace-vault.api.ts";
import type {IWorkspaceAPI} from "../02-apis/workspace/workspace.api.ts";
import type {IApplicationAPI} from "../02-apis/application/application.api.ts";
import {IEventsService} from "../02-apis/events/events.service.ts";

// todo: WorkspaceAPI should expose its own methods for events/callbacks rather than using and exposing event service?
// should EventsService become an external API plugins could also use for their own events and listening purposes?
export const EventsServiceContext = createContext<IEventsService>('IEventsService');

export const DeviceAPIContext = createContext<IDeviceAPI>('IDeviceAPI');
export const FilesAPIContext = createContext<IFilesAPI>('IFilesAPI');
export const VaultsAPIContext = createContext<IVaultsAPI>('IVaultsAPI');
export const WorkspaceVaultAPIContext = createContext<IWorkspaceVaultAPI>('IWorkspaceVaultAPI');

export const WorkspaceAPIContext = createContext<IWorkspaceAPI>('IWorkspaceAPI');
export const ApplicationAPIContext = createContext<IApplicationAPI>('IApplicationAPI');
