import { useEffect, useState } from 'react'
import { Version } from '../../../contracts/version'
import {useTranslation} from "react-i18next";

export function SystemInfo() {
	const [versions, setVersions] = useState<Version[]>([])
	const { t } = useTranslation()

	useEffect(() => {
		async function load() {
			const loadedVersions = await window.platformAPI.getVersions()
			if (!loadedVersions.error) {
				setVersions(loadedVersions.result)
			}
		}
		load()
	}, [])

	if (versions) {
		return (
			<ul className="versions">
				{versions.map((version) => (
					<li key={version.version}>
						{version.name} v{version.version}
					</li>
				))}
			</ul>
		)
	}

	return <p>{t('Versions loading...')}</p>
}
