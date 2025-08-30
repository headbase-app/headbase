import {test, expect} from "vitest";
import {render} from "vitest-browser-react";
import {TitleBar} from "@renderer/patterns/title-bar/title-bar";
import {PropsWithChildren} from "react";
import {VaultsContext} from "@renderer/modules/vaults/vaults.context";

export interface MockVaultsProviderProps extends PropsWithChildren {
	value?: Partial<VaultsContext>
}
function MockVaultsProvider({children, value}: MockVaultsProviderProps) {
	return (
		<VaultsContext.Provider value={{
			vaults: {}, isVaultsLoading: false,
			currentVault: null, isCurrentVaultLoading: false,
			openVault: async () => {},
			openVaultNewWindow: async () => {},
			...value
		}}>
			{children}
		</VaultsContext.Provider>
	)
}

test('given no current vault, title such just be headbase', async () => {
	const screen = render(
		<MockVaultsProvider>
			<TitleBar />
		</MockVaultsProvider>
	)

	await expect.element(screen.getByText("Headbase")).toBeVisible()
})

test('given current vault, title such include vault display name', async () => {
	const screen = render(
		<MockVaultsProvider value={{
			currentVault: {
				id: "67e3ed0f-567b-430a-bf21-97dbe1ad453f",
				displayName: "Example",
				path: "/example"}
		}}>
			<TitleBar />
		</MockVaultsProvider>
	)

	await expect.element(screen.getByText("Headbase | Example")).toBeVisible()
})
