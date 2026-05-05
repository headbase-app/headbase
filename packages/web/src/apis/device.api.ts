import type {IDeviceAPI} from "../../../desktop/lib";

export class DeviceAPI implements IDeviceAPI {
	async getIdentity() {
		return {
			id: "00000000-0000-0000-0000-00000000",
			name: "Test Device"
		};
	}

	async getCurrentContext() {
		return {
			id: "00000000-0000-0000-0000-00000000",
		}
	}
}
