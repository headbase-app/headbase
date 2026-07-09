import {BasePluginClass} from "./plugins/base-plugin.ts";
import {FileEditorPluginClass} from "./plugins/editor-plugin.ts";
import {DataSourcePluginClass} from "./plugins/data-source-plugin.ts";
import {ViewPluginClass} from "./plugins/view-plugin.ts";

export type PluginClass = FileEditorPluginClass | DataSourcePluginClass | ViewPluginClass

export interface IPluginStore {
	registerPlugin: (plugin: BasePluginClass) => void
	getEditors: () => Promise<FileEditorPluginClass[]>
	getDataSources: () => Promise<DataSourcePluginClass[]>
	getViews : () => Promise<ViewPluginClass[]>
}
