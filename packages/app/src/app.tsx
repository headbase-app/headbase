import {VaultMenu} from "./ui/03-features/vault-menu/vault-menu.tsx";
import {VaultManager} from "@ui/03-features/vault-manager/vault-manager.tsx";

// import {I18nAPI} from "@api/i18n/i18n.api.ts";
import {DeviceService} from "@api/device/device.service.ts";
import {EventsService} from "@api/events/events.service.ts";
import {VaultsService} from "@api/vaults/vaults.service.ts";
import {CurrentVaultService} from "@api/current-vault/current-vault.service.ts";
import {FilesAPI} from "./api/files/files.api.ts"
import {VaultsServiceContext} from "@/framework/vaults.context.ts";
import {KeyValueStoreService} from "@api/key-value-store/key-value-store.service.ts";
import {DatabaseService} from "@api/database/database.service.ts";
import {CurrentVaultServiceContext} from "@/framework/current-vault.context.ts";
import {FileSystemExplorer} from "@ui/03-features/file-system-explorer/file-system-explorer.tsx";
import {FilesAPIContext} from "@/framework/files.context.ts";
import {WorkspaceProvider} from "@/framework/workspace/workspace.provider.tsx";
import {Workspace} from "@ui/03-features/workspace/workspace.tsx";

const deviceService = new DeviceService();
const eventsService = new EventsService(deviceService);
const keyValueService = new KeyValueStoreService();
const databaseService = new DatabaseService();
const vaultsService = new VaultsService(deviceService, eventsService, keyValueService, databaseService);
const currentVaultService = new CurrentVaultService(deviceService, eventsService, vaultsService);
const filesAPI = new FilesAPI(eventsService);
// const i18nAPI = new I18nAPI();

export function App() {
	return (
		<VaultsServiceContext.Provider value={vaultsService}>
			<CurrentVaultServiceContext.Provider value={currentVaultService}>
				<FilesAPIContext.Provider value={filesAPI}>
					<WorkspaceProvider>
						<MainPage />
					</WorkspaceProvider>
				</FilesAPIContext.Provider>
			</CurrentVaultServiceContext.Provider>
		</VaultsServiceContext.Provider>
  )
}

function MainPage() {
	return (
		<>
			<VaultMenu />
			<VaultManager />
			<FileSystemExplorer />
			<Workspace />
		</>
	)
}
