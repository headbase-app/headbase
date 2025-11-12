import {type Meta, type StoryObj} from "storybook-solidjs-vite";
import { CreateVault } from "./create-vault"
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";
import {VaultsServiceContext} from "@/framework/vaults.context.ts";
import {VaultsService} from "@api/vaults/vaults.service.ts";
import {DeviceService} from "@api/device/device.service.ts";
import {EventsService} from "@api/events/events.service.ts";
import {KeyValueStoreService} from "@api/key-value-store/key-value-store.service.ts";
import {DatabaseService} from "@api/database/database.service.ts";

// todo: UI level tests should rely on props, no need to inject services with external dependencies.
const deviceService = new DeviceService();
const eventsService = new EventsService(deviceService);
const keyValueStoreService = new KeyValueStoreService();
const databaseService = new DatabaseService();
const vaultService = new VaultsService(deviceService, eventsService, keyValueStoreService, databaseService)

const meta = {
	title: "Features/CreateVault",
	component: CreateVault,
	decorators: [
		(Story) => (
			<VaultsServiceContext.Provider value={vaultService}>
				<Story />
			</VaultsServiceContext.Provider>
		)
	]
} satisfies Meta<typeof CreateVault>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
	navigate: (page: VaultManagerPage) => {console.debug(page)}
} satisfies Story;
