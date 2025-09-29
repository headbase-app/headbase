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
		<div className="bg-theme-base-bg text-theme-base-text">
			<ul>
				{versions.map((version) => (
					<li key={version.version}>
						<span className="font-semibold">{version.name}:</span> v{version.version}
					</li>
				))}
			</ul>
		</div>
	)
}
