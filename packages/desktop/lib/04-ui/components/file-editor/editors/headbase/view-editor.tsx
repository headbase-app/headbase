import { render } from 'solid-js/web'
import {onMount} from "solid-js";
import {
	FileEditorPlugin,
	FileEditorMetadata,
	PluginExposedAPIs
} from "../../../../../02-apis/plugin/plugin.api";

export class ViewEditor extends FileEditorPlugin {
	static meta: FileEditorMetadata = {
		id: "headbase--views",
		name: "Headbase Views",
		description: "Provides support for Headbase .hb files which contain data views.",
		supportedExtensions: [".hb"],
	}

	dispose!: () => void;

	async load() {
		const root = document.createElement('div')
		this.container.append(root)
		this.dispose = render(() => <ViewDisplay apis={this.apis} filePath={this.filePath} />, root)
	}

	async save() {
		console.debug(".hb save not implemented yet.")
	}

	async unload() {
		this.dispose()
	}
}


interface ViewDisplayProps {
	apis: PluginExposedAPIs
	filePath: string
}
function ViewDisplay(props: ViewDisplayProps) {
	onMount(async () => {
		const fileContents = await props.apis.filesAPI.readAsText(props.filePath)
		console.debug(fileContents)
	})

	return (
		<div>
			<h2>Headbase View</h2>
		</div>
	)
}
