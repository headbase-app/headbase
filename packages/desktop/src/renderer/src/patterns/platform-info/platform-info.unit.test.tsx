import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {PlatformInfo} from "./platform-info";
import {PropsWithChildren} from "react";
import {PlatformInfoContext} from "../../modules/platform-info/platform-info.context";

export interface MockPlatformInfoProviderProps extends PropsWithChildren {
	value: PlatformInfoContext
}
function MockPlatformInfoProvider({children, value}: MockPlatformInfoProviderProps) {
	return (
		<PlatformInfoContext.Provider value={value}>
			{children}
		</PlatformInfoContext.Provider>
	)
}

test('given versions returned, they should be displayed', async () => {
	const screen = render(
		<MockPlatformInfoProvider
			value={{
				versions: [
					{name: 'example', version: '1.0.0'}
				],
				isVersionsLoading: false,
			}}
		>
			<PlatformInfo />
		</MockPlatformInfoProvider>
	)

	await expect.element(screen.getByText('example v1.0.0')).toBeVisible()
})

test('given loading state returned, loading text should be displayed', async () => {
	const screen = render(
		<MockPlatformInfoProvider
			value={{
				versions: [
					{name: 'example', version: '1.0.0'}
				],
				isVersionsLoading: true,
			}}
		>
			<PlatformInfo />
		</MockPlatformInfoProvider>
	)

	await expect.element(screen.getByText('Versions loading...')).toBeVisible()
})
