import * as opfs from "../src"
import {afterEach, beforeEach, expect, test} from 'vitest'

beforeEach(async () => {
  await opfs.rm("/", {recursive: true})
})
afterEach(async () => {
  await opfs.rm("/", {recursive: true})
})

test('tree of empty directory root', async () => {
  const tree = await opfs.tree()
  expect(tree.path).toEqual("/")
  expect(tree.name).toEqual("/")
  expect(tree.children).toHaveLength(0)
})
