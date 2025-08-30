import {useTranslation} from "react-i18next";
import {usePlatformInfo} from "@renderer/modules/platform-info/use-platform-info";

export interface IPlatformInfoService {

}

export function PlatformInfo() {
	const { t } = useTranslation()
	const { versions, isVersionsLoading } = usePlatformInfo()

	if (isVersionsLoading) {
		return <p>{t('Versions loading...')}</p>
	}

	if (versions.length === 0) {
		return <p>{t('No platform information found.')}</p>
	}

	return (
		<ul>
			{versions.map((version) => (
				<li key={version.version}>
					{version.name} v{version.version}
				</li>
			))}
		</ul>
	)
}
