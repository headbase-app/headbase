import {PluginMetadata, PluginExposedAPIs} from "../base-plugin.ts";

export interface AppShelfPluginMetadata extends PluginMetadata {
	icon: string
}
export abstract class AppShelfPlugin {
	static meta: AppShelfPluginMetadata
	apis: PluginExposedAPIs

	constructor(apis: PluginExposedAPIs) {
		this.apis = apis
	}

	abstract trigger(): Promise<void>;
}

export type AppShelfPluginClass = (new (...args: ConstructorParameters<typeof AppShelfPlugin>) => AppShelfPlugin) & {meta: AppShelfPluginMetadata}
