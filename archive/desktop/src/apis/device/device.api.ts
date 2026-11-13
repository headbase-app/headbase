import type {IDeviceAPI} from "@headbase-app/lib";

export class DeviceAPI implements IDeviceAPI {
	readonly contextId: string

	constructor() {
		this.contextId = window.crypto.randomUUID()
	}

	async getIdentity() {
		const platformResponse = await window.platformAPI.device_getIdentity()
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}

	async getCurrentContext() {
		const platformResponse = await window.platformAPI.device_getCurrentContext()
		if (platformResponse.error) {
			throw new Error(platformResponse.identifier, {cause: platformResponse.cause})
		}
		return platformResponse.result
	}
}
