import * as opfsx from "opfsx"

import {VaultMenu} from "./ui/03-features/vault-menu/vault-menu.tsx";
import {VaultManager} from "@ui/03-features/vault-manager/vault-manager.tsx";

import {DeviceService} from "@api/headbase/services/device/device.service.ts";
import {EventsService} from "@api/headbase/services/events/events.service.ts";
import {VaultsService} from "@api/vaults/vaults.service.ts";
import {CurrentVaultService} from "@api/current-vault/current-vault.service.ts";
import {VaultsServiceContext} from "@/framework/vaults.context.ts";
import {KvStoreService} from "@api/headbase/services/kv-store/kv-store.service.ts";
import {CurrentVaultServiceContext} from "@/framework/current-vault.context.ts";
import {WorkspaceProvider} from "@/framework/workspace/workspace.provider.tsx";
import {Workspace} from "@ui/03-features/workspace/workspace.tsx";

const deviceService = new DeviceService();
const eventsService = new EventsService(deviceService);
const keyValueService = new KvStoreService();
const vaultsService = new VaultsService(deviceService, eventsService, keyValueService);
const currentVaultService = new CurrentVaultService(deviceService, eventsService, vaultsService);

// Allows for easier managing/debugging of the OPFS in Firefox where no tools/extensions exist to easily  do this.
// @ts-ignore --- adding custom property for debugging purposes.
window.opfsx = opfsx

export function App() {
	return (
		<VaultsServiceContext.Provider value={vaultsService}>
			<CurrentVaultServiceContext.Provider value={currentVaultService}>
				<WorkspaceProvider>
					<MainPage />
				</WorkspaceProvider>
			</CurrentVaultServiceContext.Provider>
		</VaultsServiceContext.Provider>
  )
}

function MainPage() {
	return (
		<>
			<VaultMenu />
			<VaultManager />
			<Workspace />
		</>
	)
}
