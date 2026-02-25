import {test, expect} from "vitest";
import {render} from "vitest-browser-react";
import {TitleBar} from "@ui/03-organisms/title-bar/title-bar";

test('given no current vault, title such just be headbase', async () => {
	const screen = render(
		<TitleBar currentVault={null} />
	)

	await expect.element(screen.getByText("Headbase")).toBeVisible()
})

test('given current vault, title such include vault display name', async () => {
	const screen = render(
		<TitleBar
			currentVault={{
				id: "67e3ed0f-567b-430a-bf21-97dbe1ad453f",
				displayName: "Example",
				path: "/example"
			}}
		/>
	)

	await expect.element(screen.getByText("Headbase | Example")).toBeVisible()
})
