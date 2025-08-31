import {useTranslation} from "react-i18next";
import {Version} from "../../../../contracts/version";

export interface PlatformInfoProps {
	versions: Version[]
	isVersionsLoading: boolean
}

export function PlatformInfo({versions, isVersionsLoading}: PlatformInfoProps) {
	const { t } = useTranslation()

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
