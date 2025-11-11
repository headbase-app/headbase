import {VaultMenu} from "./ui/03-features/vault-menu/vault-menu.tsx";
import {VaultManager} from "@ui/03-features/vault-manager/vault-manager.tsx";

// import {I18nAPI} from "@api/i18n/i18n.api.ts";
import {DeviceAPI} from "./api/device/device.api.ts";
import {EventsAPI} from "./api/events/events.api.ts";
import {VaultsAPI} from "./api/vaults/vaults.api.ts";
// import {CurrentVaultAPI} from "./api/current-vault/current-vault.api.ts";
// import {FilesAPI} from "./api/files/files.api.ts"
import {VaultsAPIContext} from "@/framework/vaults.context.ts";

const deviceAPI = new DeviceAPI();
const eventsAPI = new EventsAPI(deviceAPI);
const vaultsAPI = new VaultsAPI(deviceAPI, eventsAPI);
// const currentVaultAPI = new CurrentVaultAPI(deviceAPI, eventsAPI);
// const filesAPI = new FilesAPI(eventsAPI);
// const i18nAPI = new I18nAPI();

export function App() {
	return (
		<VaultsAPIContext.Provider value={vaultsAPI}>
			<MainPage />
		</VaultsAPIContext.Provider>
  )
}

function MainPage() {
	return (
		<>
			<VaultMenu />
			<VaultManager />
		</>
	)
}
