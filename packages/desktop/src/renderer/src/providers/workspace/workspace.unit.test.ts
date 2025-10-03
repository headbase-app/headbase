import { expect, test } from 'vitest'

test('tests should run in browser env with window', async () => {
	expect(window).toBeDefined()
	expect(window.crypto.subtle).toBeDefined()
})
