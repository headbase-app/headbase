import {BasePluginClass} from "./plugins/base-plugin.ts";
import {FileEditorPluginClass} from "./plugins/editor-plugin.ts";
import {SourcePluginClass} from "./plugins/source-plugin/source-plugin.ts";
import {ViewPluginClass} from "./plugins/view-plugin.ts";

export type PluginClass = FileEditorPluginClass | SourcePluginClass | ViewPluginClass

export interface IPluginStore {
	registerPlugin: (plugin: BasePluginClass) => void
	getEditors: () => Promise<FileEditorPluginClass[]>
	getEditorById: (id: string) => Promise<FileEditorPluginClass | null>
	getSources: () => Promise<SourcePluginClass[]>
	getSourceById: (id: string) => Promise<SourcePluginClass | null>
	getViews : () => Promise<ViewPluginClass[]>
	getViewById: (id: string) => Promise<ViewPluginClass | null>
}
