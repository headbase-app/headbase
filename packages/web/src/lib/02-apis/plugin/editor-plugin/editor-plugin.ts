import type {PluginMetadata, PluginExposedAPIs} from "../base-plugin.ts";

export interface EditorMetadata extends PluginMetadata {
	icon?: string,
	supportedTypes?: string[]
	supportsNew?: boolean
}
export abstract class EditorPlugin {
	static meta: EditorMetadata
	apis: PluginExposedAPIs
	container: HTMLElement
	documentId?: string

	constructor(apis: PluginExposedAPIs, container: HTMLElement, documentId?: string) {
		this.apis = apis
		this.container = container
		this.documentId = documentId
	}

	abstract load(): Promise<void>;
	abstract unload(): Promise<void>;
	save?(): Promise<void>;
}

export type EditorPluginClass = (new (...args: ConstructorParameters<typeof EditorPlugin>) => EditorPlugin) & {meta: EditorMetadata}
