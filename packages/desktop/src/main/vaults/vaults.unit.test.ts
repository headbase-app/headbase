import { expect, test } from 'vitest'
import { getVaults } from './vaults'

const TEST_DATA_PATH = './test-data/'

test('get vaults', async () => {
	const vaults = await getVaults(TEST_DATA_PATH)

	// todo: testing hardcoded test data
	expect(vaults).toHaveLength(2)
})
