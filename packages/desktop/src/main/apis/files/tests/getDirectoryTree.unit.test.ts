import {expect, test} from "vitest";
import {getDirectoryTree} from "../tree";

test.todo('flat tree works', async () => {
	// todo: use dir relative to test?
	const children = await getDirectoryTree('./test-data');
})
