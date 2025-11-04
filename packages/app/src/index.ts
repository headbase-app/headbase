import {VaultMenu} from "./ui/vault-menu/vault-menu.ts";
import {I18nService} from "./services/i18n.ts";
import {VaultManager} from "./ui/vault-manager/vault-manager.ts";

class Application {
	constructor() {}

	async init() {
		const i18nService = new I18nService();
		await i18nService.init();

		const vaultMenuContainer = document.querySelector<HTMLDivElement>('#vault-menu')!
		const vaultMenu = new VaultMenu(vaultMenuContainer, i18nService)
		await vaultMenu.init()

		const vaultManager = new VaultManager(i18nService)
		await vaultManager.init();
	}
}

const application = new Application();
await application.init();
