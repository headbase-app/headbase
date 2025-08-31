import {Version} from "../../../../contracts/version";
import {useEffect, useState} from "react";
import {usePlatformInfoService} from "@renderer/modules/platform-info/platform-info.context";

export interface UsePlatformInfo {
	versions: Version[]
	isVersionsLoading: boolean
}

export function usePlatformInfo(): UsePlatformInfo {
	const { platformInfoService } = usePlatformInfoService()

	const [versions, setVersions] = useState<Version[]>([])
	const [isVersionsLoading, setIsVersionsLoading] = useState(true)

	useEffect(() => {
		async function load() {
			let versions: Version[]
			try {
				versions = await platformInfoService.getVersions()
				setVersions(versions)
				setIsVersionsLoading(false)
			}
			catch (e) {
				// todo: how to handle error?
				console.error(e)
			}
		}
		load()
	}, [platformInfoService])

	return {
		versions, isVersionsLoading
	}
}
