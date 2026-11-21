import {EncryptionService, type IDeviceAPI} from "@headbase-app/lib";

export class DeviceAPI implements IDeviceAPI {
	id = EncryptionService.generateUUID()

	async getIdentity() {
		return {
			id: this.id,
			name: "Test Device"
		};
	}

	async getCurrentContext() {
		return {
			id: this.id,
		}
	}
}
