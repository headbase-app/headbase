import * as opfs from "../src"
import {afterEach, beforeEach, expect, test} from 'vitest'

beforeEach(async () => {
	await opfs.rm("/", {recursive: true})
})
afterEach(async () => {
	await opfs.rm("/", {recursive: true})
})

test("root directory", async () => {
	const rootHandle = await opfs.resolve('/')
	expect(rootHandle).toBeInstanceOf(FileSystemDirectoryHandle)
	expect(rootHandle.kind).toEqual("directory")
	expect(rootHandle.name).toEqual("/")
})

// Resolving directories that exist
test("top-level directory that exists should return handle", async () => {
	const root = await navigator.storage.getDirectory()
	await root.getDirectoryHandle("test", {create: true})

	const resolvedHandle = await opfs.resolve('/test')
	expect(resolvedHandle).toBeInstanceOf(FileSystemDirectoryHandle)
	expect(resolvedHandle.kind).toEqual("directory")
	expect(resolvedHandle.name).toEqual("test")
})

test("nested directory that exists should return handle", async () => {
	const root = await navigator.storage.getDirectory()
	const testLevel1 = await root.getDirectoryHandle("test1", {create: true})
	const testLevel2 = await testLevel1.getDirectoryHandle("test2", {create: true})
	await testLevel2.getDirectoryHandle("test3", {create: true})

	const resolvedHandle = await opfs.resolve('/test1/test2/test3')
	expect(resolvedHandle).toBeInstanceOf(FileSystemDirectoryHandle)
	expect(resolvedHandle.kind).toEqual("directory")
	expect(resolvedHandle.name).toEqual("test3")
})

test.todo("existing top-level directory with dot should return handle", async () => {})

test.todo("existing nested directories with dots should return handle", async () => {})

// Resolving files that exist
test("existing top-level file should return handle", async () => {
	const root = await navigator.storage.getDirectory()
	await root.getFileHandle("test.md", {create: true})

	const resolvedHandle = await opfs.resolve('/test')
	expect(resolvedHandle).toBeInstanceOf(FileSystemFileHandle)
	expect(resolvedHandle.kind).toEqual("file")
	expect(resolvedHandle.name).toEqual("test.md")
})

test("existing nested file should return handle", async () => {
	const root = await navigator.storage.getDirectory()
	const testLevel1 = await root.getDirectoryHandle("test1", {create: true})
	const testLevel2 = await testLevel1.getDirectoryHandle("test2", {create: true})
	await testLevel2.getFileHandle("test3.md", {create: true})

	const resolvedHandle = await opfs.resolve('/test1/test2/test3.md')
	expect(resolvedHandle).toBeInstanceOf(FileSystemFileHandle)
	expect(resolvedHandle.kind).toEqual("file")
	expect(resolvedHandle.name).toEqual("test3.md")
})

test.todo("existing top-level file without extension should return handle", async () => {})

test.todo("existing nested file without extension should return handle", async () => {})

// Resolving directories that don't exist
test("empty string should throw error", async () => {
	expect(() => opfs.resolve('')).toThrowError()
})

test("top-level directory that doesn't exist should throw error", async () => {
	expect(() => opfs.resolve('/example')).toThrowError()
})

test("nested directory that doesn't exist should throw error", async () => {
	expect(() => opfs.resolve('/example/nested')).toThrowError()
})

// Resolving file that doesn't exist
test("top-level file that doesn't exist should throw error", async () => {
	expect(() => opfs.resolve('/example.md')).toThrowError()
})

test("nested file that doesn't exist should throw error", async () => {
	expect(() => opfs.resolve('/example/nested/example.md')).toThrowError()
})

// Resolving existing ambiguous paths
test.todo("path with trailing slash should resolve to existing directory", async () => {})

test.todo("path with trailing slash should not resolve to matching existing file", async () => {})

test.todo("path without trailing slash should throw error if matching file exists", async () => {})

test.todo("path without trailing slash should not resolve to matching existing directory", async () => {})

// todo: resolving with create option, might need repeat of quite a few tests?