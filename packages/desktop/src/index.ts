import {HeadbaseApp} from "../lib/headbase.tsx";
import {DeviceAPI} from "@apis/device/device.api.ts";
import {CommonEventsService, PluginStore} from "@headbase-app/lib";
import {VaultsAPI} from "@apis/vaults/vaults.api.ts";
import {WorkspaceVaultAPI} from "@apis/workspace-vault/workspace-vault.api.ts";
import {FilesAPI} from "@apis/files/files.api.ts";

const root = document.getElementById('root')!

const deviceAPI = new DeviceAPI();
const eventsService = new CommonEventsService(deviceAPI);
const vaultsAPI = new VaultsAPI(eventsService, deviceAPI);
const workspaceVaultAPI = new WorkspaceVaultAPI(eventsService, deviceAPI, vaultsAPI);
const filesAPI = new FilesAPI(eventsService);
const pluginStore = new PluginStore(deviceAPI, filesAPI);

const headbase = new HeadbaseApp({
	root,
	deps: {
		deviceAPI,
		eventsService,
		vaultsAPI,
		workspaceVaultAPI,
		filesAPI,
		pluginStore,
	},
})
headbase.load()
