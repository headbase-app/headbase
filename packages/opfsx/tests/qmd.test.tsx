import * as opfs from "../src/opfs"

import {afterEach, beforeEach, expect, test} from 'vitest'
import frontmatter from "frontmatter";

beforeEach(async () => {
  await opfs.rm("/", {recursive: true})
})
afterEach(async () => {
  await opfs.rm("/", {recursive: true})
})

const FOLDER_COUNT = 100
const FILE_COUNT = 20
const CONTENT_CHARACTER_COUNT = 30000

async function makeTestContent() {
  for (let folderNumber = 1; folderNumber <= FOLDER_COUNT; folderNumber++) {
    await opfs.mkdir(`/qmd-tests/folder-${folderNumber}`)

    for (let fileNumber = 1; fileNumber <= FILE_COUNT; fileNumber++) {
      const filename = `file-${fileNumber}.md`
      const extraContent = 'a'.repeat(CONTENT_CHARACTER_COUNT)
      const content = `
---
directory: ${folderNumber}
file: ${fileNumber}
---

# test ${fileNumber}
this is **test file** ${fileNumber} in folder ~~${folderNumber}~~
${extraContent}
`.trim()

      await opfs.write(`/qmd-tests/folder-${folderNumber}/${filename}`, content)
    }
  }
}

test('query markdown', async () => {
  console.time('create-files')
  await makeTestContent()
  console.timeEnd('create-files')

  console.time('tree')
  await opfs.tree('/qmd-tests')
  console.timeEnd('tree')

  console.time('read-single')
  const testFile5 = await opfs.read("/qmd-tests/folder-5/file-5.md")
  console.timeEnd('read-single')

  console.time('get-text-content')
  const testFile5Content = await testFile5.text()
  const data = frontmatter(testFile5Content)
  expect(data.data.file).toEqual(5)
  console.timeEnd('get-text-content')

  console.time('ls')
  const items = await opfs.ls('/qmd-tests', {recursive: true})
  const files = items.filter(item => item.kind === 'file')
  console.timeEnd('ls')

  console.time('query')
  const results: string[] = []
  for (const opfsFile of files) {
    const file = await opfsFile.handle.getFile()
    const fileContent = await file.text()
    const parsed = frontmatter(fileContent)
    if (parsed.data.file === 5) {
      results.push(opfsFile.path)
    }
  }
  console.timeEnd('query')

  expect(results.length).toEqual(FOLDER_COUNT)

  console.debug(
    'Summary:\n',
    `${FOLDER_COUNT} folders of ${FILE_COUNT} files, ${FOLDER_COUNT * FILE_COUNT} files total\n`,
    `each file containing ~${CONTENT_CHARACTER_COUNT} characters`
  )
})
