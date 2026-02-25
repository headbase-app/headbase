import type {DeviceContext, DeviceIdentity, IDeviceAPI} from "@headbase-app/libweb";

export class WebDeviceApi implements IDeviceAPI {
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
}
