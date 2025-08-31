import {IPlatformInfoService} from "@renderer/modules/platform-info/platform-info.interface";

export class WebPlatformInfoService implements IPlatformInfoService {
	async getVersions() {
		const versionsResult = await window.platformAPI.getVersions()
		if (versionsResult.error) {
			throw versionsResult.error
		}
		return versionsResult.result
	}
}
