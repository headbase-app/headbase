import {LitElement} from "lit";

/**
 * Override the default Event typing to set an explicit target element.
 * This allows easier typing of things like input event listeners accessing e.target.value
 */
export type EventWithTarget<Target> = Event & {
	target: Target
}

/**
 * A base class for Lit components which don't use the Shadow DOM.
 */
export class BaseElement extends LitElement {
	createRenderRoot() {
		return this;
	}
}
