import {type Meta, type StoryObj} from "storybook-solidjs-vite";
import { CreateVault } from "./create-vault"
import type {VaultManagerPage} from "packages/web/lib/03-ui/components/vault-manager/vault-manager.jsx";
import {VaultsAPIContext} from "packages/mobile/src/framework/vaults.context.js";
import {WebDeviceApi} from "packages/mobile/src/apis/web/device/web-device.api.js";
import {CommonEventsService, CommonVaultsAPI} from "packages/lib";
import {WebDatabaseService} from "packages/mobile/src/apis/web/database/web-database.service.js";

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
