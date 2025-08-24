import { useEffect, useState } from 'react'
import { Version } from '../../../types/version'

export function SystemInfo() {
	const [versions, setVersions] = useState<Version[]>([])

	useEffect(() => {
		async function load() {
			const loadedVersions = await window.platformAPI.versions()
			setVersions(loadedVersions)
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

	return <p>Versions loading...</p>
}
