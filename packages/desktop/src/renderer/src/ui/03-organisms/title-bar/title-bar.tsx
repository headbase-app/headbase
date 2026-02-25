import {Vault} from "../../../../../contracts/vaults";

export interface TitleBarProps {
	currentVault: Vault | null
}

export function TitleBar({currentVault}: TitleBarProps) {
	const windowTitle = currentVault ? `${currentVault.displayName} | Headbase` : "Headbase"

	return (
		<div className="absolute bg-theme-titlebar-bg font-bold text-sm text-theme-titlebar-text h-[30px] [app-region:drag] w-full flex items-center justify-center hover:cursor-pointer">
			<p>{windowTitle}</p>
		</div>
	)
}
