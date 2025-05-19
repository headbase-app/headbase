import * as opfs from "../src/opfs"
import {afterEach, beforeEach, expect, test} from 'vitest'

beforeEach(async () => {
  await opfs.rm("/", {recursive: true})
})
afterEach(async () => {
  await opfs.rm("/", {recursive: true})
})

test('read and write files', async () => {
  const content = "# test 1  \n this is just a **test**"
  const filename = "/test1.md"
  await opfs.write(filename, content)

  const newFile = await opfs.read(filename)
  const newFileContent = await newFile.text()
  expect(newFileContent).toEqual(content)
})
