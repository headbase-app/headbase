import {html} from "lit-html";

import {BaseElement} from "../../../../03-framework/base-element";
import {useContext} from "../../../../03-framework/context";
import {VaultsAPIContext} from "../../../../03-framework/contexts";
import {dispatchEvent} from "../../../../03-framework/events.ts";
import type {VaultManagerEvents} from "../vault-manager";
import type {VaultFormFields} from "../vault-form.ts";

export class CreateVault extends BaseElement {
	static tag = "hb-create-vault"
	vaultsAPI = useContext(VaultsAPIContext)

	async onSubmit(values: VaultFormFields) {
		// todo: logic which should be managed at platform level via APIs? .getVaultLocation() which either returns null or path, rather than isLocationSelectable()
		const path = this.vaultsAPI.isLocationSelectable()
			? values.path
			: `/headbase-v1/vaults/${values.displayName}`

		await this.vaultsAPI.create({displayName: values.displayName, path})
		dispatchEvent<VaultManagerEvents>(this, "vault-manager:navigate", {type: "list"})
	}

	render() {
		return html`
			<hb-vault-form
				title="Create new vault"
				.submitText=${"Create vault"}
				.onSubmit=${this.onSubmit.bind(this)}
			></hb-vault-form>
		`
	}
}
