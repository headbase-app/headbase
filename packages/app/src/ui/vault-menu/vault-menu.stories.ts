import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {html} from "lit";

import {I18nAPI} from "@api/i18n/i18n.api.ts";
import {VaultsAPI} from "@api/vaults/vaults.api.ts";
import {DeviceAPI} from "@api/device/device.api.ts";
import {EventsAPI} from "@api/events/events.api.ts";
import type {VaultMenuProps} from "@ui/vault-menu/vault-menu.ts";
import "@ui/vault-menu/vault-menu.ts"

const deviceAPI = new DeviceAPI()
const eventsAPI = new EventsAPI(deviceAPI)
const i18nAPI = new I18nAPI()
const vaultsAPI = new VaultsAPI(deviceAPI, eventsAPI)

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
	title: 'VaultMenu',
	argTypes: {},
	args: {},
	render: (args: VaultMenuProps) => {
		return html`<vault-menu .i18nAPI=${i18nAPI} .vaultsAPI=${vaultsAPI} .currentVault=${args.currentVault}></vault-menu>`
	}
} satisfies Meta<VaultMenuProps>;

export default meta;
type Story = StoryObj<VaultMenuProps>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
	args: {},
};

export const OpenVault: Story = {
	args: {
		currentVault: {
			id: "7be4337a-9bd3-4831-b7b1-997100ad5aab",
			displayName: "Example Vault",
			path: "/example"
		}
	},
};
