import type {DeviceContext, DeviceIdentity, IDeviceService} from "@api/headbase/services/device/device.interface.ts";

export class DeviceService implements IDeviceService {
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
		return "pwa"
	}
}
