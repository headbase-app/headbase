import {HeadbaseApp} from "./app.ts"
import {
	FileExplorer,
} from "@ui/components/file-explorer.ts";
import {AppPage, SelectVaultPage, WelcomePage} from "@headbase-app/lib";

customElements.define(HeadbaseApp.tag, HeadbaseApp)

customElements.define(WelcomePage.tag, WelcomePage)
customElements.define(SelectVaultPage.tag, SelectVaultPage)
customElements.define(AppPage.tag, AppPage)

customElements.define(FileExplorer.tag, FileExplorer)
