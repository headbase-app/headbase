import {type PropsWithChildren, useEffect, useState} from "react";
import {PlatformInfoContext} from "./platform-info.context";
import {Version} from "../../../../contracts/version";

export function PlatformInfoProvider({children}: PropsWithChildren) {
	const [versions, setVersions] = useState<Version[]>([])
	const [isVersionsLoading, setIsVersionsLoading] = useState(true)

	useEffect(() => {
		async function load() {
			const versionsResult = await window.platformAPI.getVersions()
			if (!versionsResult.error) {
				setVersions(versionsResult.result)
			}
			else {
				// todo: how to handle error?
				console.error(versionsResult)
			}

			setIsVersionsLoading(false)
		}
		load()
	}, [])

	const value: PlatformInfoContext = {
		versions, isVersionsLoading,
	}

	return (
		<PlatformInfoContext.Provider value={value}>
			{children}
		</PlatformInfoContext.Provider>
	)
}
