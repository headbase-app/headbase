import type {ReactiveController, ReactiveControllerHost, TemplateResult} from 'lit';
import {ContextProvider} from "@lit/context";

export type Routes = {
	path: string
	render: () => TemplateResult
}[]

export interface MemoryRouterOptions {
	host: ReactiveControllerHost
	context: ContextProvider<{__context__: string}>
	routes: Routes
}

/**
 * A "router" component for displaying different components based on a path.
 * Accepts a context which is used to store the actual path.
 */
export class MemoryRouter implements ReactiveController {
	host: ReactiveControllerHost;
	context: ContextProvider<{__context__: string}>
	routes: Routes

	constructor(options: MemoryRouterOptions) {
		this.host = options.host;
		this.host.addController(this);
		this.context = options.context;
		this.routes = options.routes;
	}

	hostConnected() {}

	hostDisconnected() {}

	outlet() {
		const currentPath = this.context.value

		for (const route of this.routes) {
			if (route.path === currentPath) {
				return route.render()
			}
		}
	}
}
