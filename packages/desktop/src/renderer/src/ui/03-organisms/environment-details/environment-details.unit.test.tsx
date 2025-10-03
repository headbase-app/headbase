import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {EnvironmentDetails} from "./environment-details";

test('given versions returned, they should be displayed', async () => {
	const screen = render(
		<EnvironmentDetails
			environment={{
				name: 'linux',
				versions: [
					{name: 'example', version: '1.0.0'}
				]
			}}
			isEnvironmentLoading={false}
		/>
	)

	await expect.element(screen.getByText('example v1.0.0')).toBeVisible()
})

test('given loading state returned, loading text should be displayed', async () => {
	const screen = render(
		<EnvironmentDetails
			environment={{
				name: 'linux',
				versions: [
					{name: 'example', version: '1.0.0'}
				]
			}}
			isEnvironmentLoading={true}
		/>
	)

	await expect.element(screen.getByText('Environment details loading...')).toBeVisible()
})
