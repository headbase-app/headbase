import type {InstantiablePlugin, PluginUsableAPIs} from "./plugin.api.ts";

export class FileEditorReadOnlyPlugin {
	constructor(
		// @ts-ignore
		protected apis: PluginUsableAPIs
	) {}

	// @ts-ignore
	isFileSupported(filePath: string) {return false};

	// @ts-ignore
	async load(filePath: string, targetElement: HTMLElement) {}

	// @ts-ignore
	async close() {}
}

export class FileEditorPlugin extends FileEditorReadOnlyPlugin {
	async save() {}
}

export type AnyFilePlugin =
	InstantiablePlugin<FileEditorReadOnlyPlugin>
	| InstantiablePlugin<FileEditorPlugin>
