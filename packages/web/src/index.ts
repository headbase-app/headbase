import {
	AppPage, SelectVaultPage, WelcomePage,
	VaultManager, VaultsList,
	FileExplorer
} from "@headbase-app/lib";
import {HeadbaseApp} from "./app.ts"

customElements.define(HeadbaseApp.tag, HeadbaseApp)

customElements.define(WelcomePage.tag, WelcomePage)
customElements.define(SelectVaultPage.tag, SelectVaultPage)
customElements.define(AppPage.tag, AppPage)

customElements.define(VaultManager.tag, VaultManager)
customElements.define(VaultsList.tag, VaultsList)

customElements.define(FileExplorer.tag, FileExplorer)
