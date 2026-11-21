import {createContext} from "./context.ts";

import type {IDeviceAPI} from "../02-apis/device/device.api.ts";
import type {IDatabaseManagerAPI} from "../02-apis/database-manager/database-manager.api.ts";
import type {IDatabaseSwitcherAPI} from "../02-apis/database-switcher/database-switcher.api.ts";
import type {IWorkspaceAPI} from "../02-apis/workspace/workspace.api.ts";
import type {IApplicationAPI} from "../02-apis/application/application.api.ts";
import type {IEventsService} from "../02-apis/events/events.service.ts";
import type {MatterWebProxy} from "@apis/matter-proxy.ts";

export const EventsServiceContext = createContext<IEventsService>('EventsServiceContext');
export const DeviceAPIContext = createContext<IDeviceAPI>('IDeviceAPI');

export const DatabaseManagerAPIContext = createContext<IDatabaseManagerAPI>('IDatabaseManagerAPI');
export const DatabaseSwitcherAPIContext = createContext<IDatabaseSwitcherAPI>('IDatabaseSwitcherAPI');

export const WorkspaceAPIContext = createContext<IWorkspaceAPI>('IWorkspaceAPI');
export const ApplicationAPIContext = createContext<IApplicationAPI>('IApplicationAPI');

export const MatterDatabaseAPIContext = createContext<MatterWebProxy>('IMatterDatabase');
