import type {PluginMetadata, PluginExposedAPIs} from "../base-plugin.ts";

export interface EditorMetadata extends PluginMetadata {
	icon?: string,
	supportedTypes?: string[]
}

export abstract class EditorPlugin {
	static meta: EditorMetadata
	apis: PluginExposedAPIs
	container: HTMLElement

	constructor(apis: PluginExposedAPIs, container: HTMLElement) {
		this.apis = apis
		this.container = container
	}

	loadNew?(): Promise<void>;
	abstract load(documentId: string): Promise<void>;
	abstract unload(): Promise<void>;

	save?(): Promise<void>;
}

export type EditorPluginClass = (new (...args: ConstructorParameters<typeof EditorPlugin>) => EditorPlugin) & {meta: EditorMetadata}
