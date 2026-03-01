import {type Meta, type StoryObj} from "storybook-solidjs-vite";
import { CreateVault } from "./create-vault"
import type {VaultManagerPage} from "@ui/03-features/vault-manager/vault-manager.tsx";
import {VaultsAPIContext} from "@framework/vaults.context.ts";
import {WebDeviceApi} from "@apis/web/device/web-device.api.ts";
import {CommonEventsService, CommonVaultsAPI} from "@headbase-app/libweb";
import {WebDatabaseService} from "@apis/web/database/web-database.service.ts";

// todo: UI level tests should rely on props, no need to inject services with external dependencies?
const databaseService = new WebDatabaseService();
const deviceAPI = new WebDeviceApi();
const eventsService = new CommonEventsService(deviceAPI);
const vaultsAPI = new CommonVaultsAPI(databaseService, deviceAPI, eventsService)

const meta = {
	title: "Features/CreateVault",
	component: CreateVault,
	decorators: [
		(Story) => (
			<VaultsAPIContext.Provider value={vaultsAPI}>
				<Story />
			</VaultsAPIContext.Provider>
		)
	]
} satisfies Meta<typeof CreateVault>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
	navigate: (page: VaultManagerPage) => {console.debug(page)}
} satisfies Story;
