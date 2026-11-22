import {html, nothing} from "lit-html";
import {
	ApplicationAPIContext,
	BaseElement,
	DeviceAPIContext, MatterDatabaseAPIContext,
	useContext, WorkspaceAPIContext
} from "@headbase-app/lib";
import type {WorkspaceItem} from "@headbase-app/lib";

export class WorkspacePluginItem extends BaseElement {
	static tag = "hb-workspace-plugin-item";
	// todo: should be exposed as item types, so no need to extract from union
	item!: WorkspaceItem

	deviceAPI = useContext(DeviceAPIContext)
	workspaceAPI = useContext(WorkspaceAPIContext)
	applicationAPI = useContext(ApplicationAPIContext)
	databaseAPI = useContext(MatterDatabaseAPIContext)

	status: "loading" | "not-found" | "loaded" = "loading"

	async connectedCallback() {
		const plugin = await this.applicationAPI.getWorkspaceItemById(this.item.plugin)
		if (plugin) {
			this.workspaceAPI.update(this.item.id, {name: plugin.meta.name})
			const instance = new plugin({deviceAPI: this.deviceAPI, workspaceAPI: this.workspaceAPI, databaseAPI: this.databaseAPI, applicationAPI: this.applicationAPI}, this, this.item)
			await instance.load(...(this.item.data ?? []))
			this.status = "loaded"
		}
		else {
			this.status = "not-found"
		}

		super.connectedCallback();
	}

	render() {
		if (this.status === "loading") {
			return html`
				<div>
					<p>Loading...</p>
				</div>
			`
		}
		else if (this.status === "not-found") {
			return html`
				<div>
					<p>No plugin found for item type <b>${this.item.plugin}</b></p>
					<p>Ensure you have a plugin installed which provides support for this type</p>
					<p>${JSON.stringify(this.item)}</p>
				</div>
			`
		}
		return nothing
	}
}
