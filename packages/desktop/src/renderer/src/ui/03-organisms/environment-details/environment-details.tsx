import {useTranslation} from "react-i18next";
import {Environment} from "@/contracts/environment";

export interface EnvironmentDetailsProps {
	environment: Environment
	isEnvironmentLoading: boolean
}

export function EnvironmentDetails({environment, isEnvironmentLoading}: EnvironmentDetailsProps) {
	const { t } = useTranslation()

	if (isEnvironmentLoading) {
		return <p>{t('Environment details loading...')}</p>
	}

	if (!environment) {
		return <p>{t('No Environment details found.')}</p>
	}

	return (
		<div className="bg-theme-base-bg text-theme-base-text">
			<p><strong className="font-semibold">App Version: </strong>0.0.0</p>
			<p><strong className="font-semibold">Platform Name: </strong>{environment.name}</p>
			<p>Platform Versions:</p>
			<ul className='ml-6'>
				{environment.versions.map((version) => (
					<li key={version.version}>
						<span className="font-semibold">{version.name}:</span> v{version.version}
					</li>
				))}
			</ul>
		</div>
	)
}

