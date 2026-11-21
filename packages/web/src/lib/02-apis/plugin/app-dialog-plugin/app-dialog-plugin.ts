import type {PluginMetadata, PluginExposedAPIs} from "../base-plugin.ts";

export interface AppDialogPluginMetadata extends PluginMetadata {
	// todo: review types / accessibility (closable dialog vs alert confirmation)
	type?: "dialog" | "alert"
}

export abstract class AppDialogPlugin {
	static meta: AppDialogPluginMetadata
	apis: PluginExposedAPIs

	constructor(apis: PluginExposedAPIs) {
		this.apis = apis
	}

	abstract trigger(): Promise<void>;
}

export type AppDialogPluginClass = (new (...args: ConstructorParameters<typeof AppDialogPlugin>) => AppDialogPlugin) & {meta: AppDialogPluginMetadata}
