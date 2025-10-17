import { expect, test } from 'vitest'
import { getVaults } from './vaults'

const TEST_DATA_PATH = './test-data/'

test('given no vaults file, no vaults should be returned ', async () => {
	const vaults = await getVaults(TEST_DATA_PATH)
	expect(Object.keys(vaults)).toHaveLength(0)
})
