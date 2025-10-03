import {DeviceContext, DeviceIdentity, IDeviceAPI} from "@api/device/device.interface";

export class DeviceAPI implements IDeviceAPI {
	readonly contextId: string

	constructor() {
		this.contextId = window.crypto.randomUUID()
	}

	getIdentity(): DeviceIdentity {
		return {
			id: "00000000-0000-0000-0000-00000000",
			name: "Test Device"
		};
	}

	getCurrentContext(): DeviceContext {
		return {
			id: this.contextId,
		}
	}

	async getEnvironment() {
		const versionsResult = await window.platformAPI.getEnvironment()
		if (versionsResult.error) {
			throw versionsResult.error
		}
		return versionsResult.result
	}
}
