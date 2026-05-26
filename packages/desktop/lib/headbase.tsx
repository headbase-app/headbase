import { render } from 'solid-js/web'

import {IDeviceAPI} from "./02-apis/device/device.api.ts";
import {IEventsService} from "./02-apis/events/events.service.ts";
import {IVaultsAPI} from "./02-apis/vaults/vaults.api.ts";
import {IWorkspaceVaultAPI} from "./02-apis/workspace-vault/workspace-vault.api.ts";
import {IFilesAPI} from "./02-apis/files/files.api.ts";
import {IPluginStore} from "./02-apis/plugin/plugin.api.ts";
import {HeadbaseCorePlugin} from "./headbase-plugin.ts";

import App from './app'

export interface InjectedDependencies {
	deviceAPI: IDeviceAPI,
	eventsService: IEventsService,
	vaultsAPI: IVaultsAPI,
	workspaceVaultAPI: IWorkspaceVaultAPI,
	filesAPI: IFilesAPI,
	pluginStore: IPluginStore,
}

export interface HeadbaseAppProps {
	root: HTMLElement,
	deps: InjectedDependencies
}

export class HeadbaseApp {
	deviceAPI: IDeviceAPI
	eventsService: IEventsService
	vaultsAPI: IVaultsAPI
	workspaceVaultAPI: IWorkspaceVaultAPI
	filesAPI: IFilesAPI
	pluginStore: IPluginStore

	constructor(props: HeadbaseAppProps) {
		this.deviceAPI = props.deps.deviceAPI
		this.eventsService = props.deps.eventsService
		this.vaultsAPI = props.deps.vaultsAPI
		this.workspaceVaultAPI = props.deps.workspaceVaultAPI
		this.filesAPI = props.deps.filesAPI
		this.pluginStore = props.deps.pluginStore
	}

	load() {
		this.pluginStore.registerBasePlugin(HeadbaseCorePlugin)
		const root = document.getElementById('root')
		render(() => (
			<App
				deviceAPI={this.deviceAPI}
				eventsService={this.eventsService}
				vaultsAPI={this.vaultsAPI}
				workspaceVaultAPI={this.workspaceVaultAPI}
				filesAPI={this.filesAPI}
				pluginStore={this.pluginStore}
			/>
		), root!)
	}
}
