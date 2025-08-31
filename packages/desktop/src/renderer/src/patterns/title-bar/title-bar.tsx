import styles from "./title-bar.module.css"
import {Vault} from "../../../../contracts/vaults";

export interface TitleBarProps {
	currentVault: Vault | null
}

export function TitleBar({currentVault}: TitleBarProps) {
	const windowTitle = currentVault ? `Headbase | ${currentVault.displayName}` : "Headbase"

	return (
		<div className={styles['title-bar']}>
			<p>{windowTitle}</p>
		</div>
	)
}
