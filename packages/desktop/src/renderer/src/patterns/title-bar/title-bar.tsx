import styles from "./title-bar.module.css"
import {useVaults} from "@renderer/modules/vaults/use-vaults";

export function TitleBar() {
	const { currentVault } = useVaults()

	const windowTitle = currentVault ? `Headbase | ${currentVault.displayName}` : "Headbase"

	return (
		<div className={styles['title-bar']}>
			<p>{windowTitle}</p>
		</div>
	)
}
