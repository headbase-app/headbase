import type {IDeviceAPI} from "@headbase-app/lib";

export class DeviceAPI implements IDeviceAPI {
	readonly contextId: string

	constructor() {
		this.contextId = window.crypto.randomUUID()
	}

	async getIdentity() {
		return {
			id: "00000000-0000-0000-0000-00000000",
			name: "Test Device"
		};
	}

	async getCurrentContext() {
		return {
			id: this.contextId,
		}
	}
}
