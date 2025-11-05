import {LitElement} from "lit";

export class LightDomLitElement extends LitElement {
	createRenderRoot() {
		return this;
	}
}
