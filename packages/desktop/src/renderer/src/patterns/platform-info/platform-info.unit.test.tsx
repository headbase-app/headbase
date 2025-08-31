import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {PlatformInfo} from "./platform-info";

test('given versions returned, they should be displayed', async () => {
	const screen = render(
		<PlatformInfo
			versions={[
				{name: 'example', version: '1.0.0'}
			]}
			isVersionsLoading={false}
		/>
	)

	await expect.element(screen.getByText('example v1.0.0')).toBeVisible()
})

test('given loading state returned, loading text should be displayed', async () => {
	const screen = render(
		<PlatformInfo
			versions={[
				{name: 'example', version: '1.0.0'}
			]}
			isVersionsLoading={true}
		/>
	)

	await expect.element(screen.getByText('Versions loading...')).toBeVisible()
})
