import {html} from "lit";
import {provide} from '@lit/context';
import { customElement } from "lit/decorators.js";
import {I18nAPI} from "@api/i18n/i18n.api.ts";
import {LightDomLitElement} from "@utils/light-dom-lit-element.ts";

import {DeviceAPI} from "./api/device/device.api.ts";
import {EventsAPI} from "./api/events/events.api.ts";
import {VaultsAPI} from "./api/vaults/vaults.api.ts";
import {CurrentVaultAPI} from "./api/current-vault/current-vault.api.ts";
// import {FilesAPI} from "./api/files/files.api.ts"
import {currentVaultAPIContext, i18nAPIContext, vaultsAPIContext} from "@/framework/context.ts";

import "@ui/vault-menu/vault-menu.ts"
import "@ui/vault-manager/vault-manager.ts"

const deviceAPI = new DeviceAPI();
const eventsAPI = new EventsAPI(deviceAPI);
const vaultsAPI = new VaultsAPI(deviceAPI, eventsAPI);
const currentVaultAPI = new CurrentVaultAPI(deviceAPI, eventsAPI);
// const filesAPI = new FilesAPI(eventsAPI);
const i18nAPI = new I18nAPI();

@customElement("headbase-app")
export class HeadbaseApp extends LightDomLitElement {
	@provide({context: currentVaultAPIContext})
	currentVaultAPI = currentVaultAPI

	@provide({context: vaultsAPIContext})
	vaultsAPI = vaultsAPI

	@provide({context: i18nAPIContext})
	i18nAPI = i18nAPI

	protected render(): unknown {
		return html`
			<div>
				<vault-menu></vault-menu>
				<vault-manager></vault-manager>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'headbase-app': HeadbaseApp
	}
}
