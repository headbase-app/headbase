import {createRoot, type Root} from "react-dom/client";

export function Nested() {
	return (
		<p>nested</p>
	)
}

class Plugin {
	container: HTMLDivElement
	reactRoot?: Root

	constructor(container: HTMLDivElement) {
		this.container = container;
	}

	init() {
		this.reactRoot = createRoot(this.container)
		this.reactRoot.render(<Nested />)
	}

	teardown() {
		if (this.reactRoot) {
			this.reactRoot.unmount()
		}
	}
}

export default {
	meta: {
		name: "Example Core",
		version: 1.0
	},
	plugin: Plugin
}
