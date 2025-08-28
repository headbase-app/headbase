import {useEffect, useState} from "react";
import {Vault} from "../../../contracts/vaults";
import {useTranslation} from "react-i18next";

export function VaultList() {
	const { t } = useTranslation()

	const [vaults, setVaults] = useState<Vault[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function load() {
			const loadedVaults = await window.platformAPI.getVaults()
			setVaults(loadedVaults)
			setIsLoading(false)
		}
		load()
	}, [])

	if (isLoading) {
		return (
			<p>{t("Loading...")}</p>
		)
	}

	if (vaults.length === 0) {
		return (
			<p>{t("No vaults found...")}</p>
		)
	}

	return (
		<ul>
			{vaults.map((vault) => (
				<li key={vault.id}>{vault.displayName}</li>
			))}
		</ul>
	)
}
