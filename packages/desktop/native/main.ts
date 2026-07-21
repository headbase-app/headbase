import {app, BrowserWindow, ipcMain, IpcMainInvokeEvent, protocol, shell} from 'electron';
import {join as path_join} from 'node:path';
import started from 'electron-squirrel-startup';

// importing specific file to prevent including web only deps (like pdfjs-dist) in Node.js (see /docs/technical-debt.md)
import {CreateVaultDto, UpdateVaultDto} from "@headbase-app/lib/dist/02-apis/vaults/vault.ts";

import {createVault, deleteVault, getVault, queryVaults, selectLocation, updateVault} from "./main/vaults/vaults";
import {glob, read, readAsText, readAsUrl, stat, tree, write, writeText} from "./main/files/operations";

// @ts-expect-error -- todo: icon not found?
import icon from './resources/icon.png'

// Override package.json name, ensures calls like `getPath` just use 'headbase'.
app.setName('headbase')
const USER_DATA_PATH = app.getPath('userData')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {app.quit()}

// Store the current vault each window has open.
// - Used to allow windows to open with a pre-selected vault.
// - Used as a security measure to restrict file system access of renderer IPC calls to the current vault folder.
const windowVaults = new Map<number, string>()

async function getSenderContext(event: IpcMainInvokeEvent) {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (senderWindow) {
		const currentVaultId = windowVaults.get(senderWindow.id)
		if (currentVaultId) {
			const vault = await getVault(USER_DATA_PATH, currentVaultId)
			return {id: senderWindow.id, vault: vault}
		}

		return {id: senderWindow.id}
	}

	throw new Error("Could not resolve sender context")
}

function createWindow(vaultId?: string): void {
	// Create a window, hidden by default
	const window = new BrowserWindow({
		show: false,
		titleBarStyle: 'default', // todo: switch to hidden once app styled custom bar is created
		autoHideMenuBar: true,
		...(process.platform !== 'darwin' ? {
			titleBarOverlay: {
				color: "#191B23",
				symbolColor: "#fff",
				height: 30
			}
		} : {}),
		...(process.platform === 'linux' ? { icon } : {}),
		webPreferences: {
			preload: path_join(__dirname, 'preload.js'),
		},
	})

	// Ensure open vault status is up to date.
	if (vaultId) {
		windowVaults.set(window.id, vaultId)
	}
	else if (windowVaults.has(window.id)) {
		windowVaults.delete(window.id)
	}

	// Delay showing the window until it is ready.
	window.on('ready-to-show', () => {
		window.show()
	})

	// Prevent new windows from being open within the app, and direct links to open externally.
	window.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url)
		return { action: 'deny' }
	})

	// Ensure open vault is removed from store when window is closed
	window.on('closed', () => {
		if (windowVaults.has(window.id)) {
			windowVaults.delete(window.id)
		}
	})

	// HMR for renderer, load the remote URL for development or the local html file for production.
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
		window.webContents.openDevTools()
	}
	else {
		window.loadFile(
			path_join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
		);
	}
}

// Register custom protocol used for loading/streaming files via URL (hb://path/to/file).
protocol.registerSchemesAsPrivileged([
	{scheme: 'hb', privileges: {bypassCSP: true, stream: true}},
])

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
	protocol.handle("hb", async (request) => {
		const encodedFilePath = request.url.slice("hb://".length)
		const filePath = decodeURIComponent(encodedFilePath)

		// todo: add security to restrict access to known vaults

		// todo: allow streaming of video and audio?

		// todo: load without stats for perf?
		const result = await read(filePath)
		console.debug(`[hb protocol] File requested ${filePath}`)

		return new Response(result.buffer, {
			status: 200,
		})
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

// On OS X it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


/**
 * Platform Information
 */
ipcMain.handle('device_getCurrentContext', () => {
	return {
		error: false,
		result: {
			id: "00000000-0000-0000-0000-00000000",
		}
	}
})
ipcMain.handle('device_getIdentity', () => {
	return {
		error: false,
		result: {
			id: "00000000-0000-0000-0000-00000000",
			name: "Test Device"
		}
	}
})

/**
 * Vaults
 */
ipcMain.handle('vaults_selectLocation', async (event) => {
	try {
		const senderWindow = BrowserWindow.fromWebContents(event.sender);
		if (!senderWindow) {
			return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
		}

		const result = await selectLocation(senderWindow)
		return {error: false, result}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('vaults_create', async (_event, createVaultDto: CreateVaultDto) => {
	try {
		const result = await createVault(USER_DATA_PATH, createVaultDto)
		return {error: false, result}
	}
	catch (e) {
		if (e?.type === 'vault-not-found') {
			return {error: true, identifier: 'vault-not-found', message: 'Requested vault could not be found.'}
		}

		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('vaults_update', async (_event, vaultId: string, updateVaultDto: UpdateVaultDto) => {
	try {
		const result = await updateVault(USER_DATA_PATH, vaultId, updateVaultDto)
		return {error: false, result}
	}
	catch (e) {
		if (e?.type === 'vault-not-found') {
			return {error: true, identifier: 'vault-not-found', message: 'Requested vault could not be found.'}
		}

		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('vaults_delete', async (_event, vaultId: string) => {
	try {
		await deleteVault(USER_DATA_PATH, vaultId)
		return {error: false}
	}
	catch (e) {
		if (e?.type === 'vault-not-found') {
			return {error: true, identifier: 'vault-not-found', message: 'Requested vault could not be found.'}
		}

		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('vaults_get', async (_event, vaultId: string) => {
	try {
		const vault = await getVault(USER_DATA_PATH, vaultId)
		if (vault) {
			return {error: false, result: vault}
		}
		return {error: true, identifier: 'vault-not-found', message: 'Window has current vault which could not be found.'}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('vaults_query', async () => {
	try {
		const vaults = await queryVaults(USER_DATA_PATH)
		return {error: false, result: vaults}
	}
		// todo: handle other errors?
	catch (e) {
		return {error: true, identifier: '', cause: e}
	}
})

ipcMain.handle('workspaceVault_open', (event, vaultId: string) => {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (!senderWindow) {
		return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
	}

	windowVaults.set(senderWindow.id, vaultId)
	return {error: false}
})

ipcMain.handle('workspaceVault_openNewContext', (event, vaultId: string) => {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (!senderWindow) {
		return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
	}

	createWindow(vaultId)
	return {error: false}
})

ipcMain.handle('workspaceVault_get', async (event) => {
	const senderContext = await getSenderContext(event)
	return {error: false, result: senderContext.vault}
})

ipcMain.handle('workspaceVault_close', async (event) => {
	const senderContext = await getSenderContext(event)
	windowVaults.delete(senderContext.id)
	return {error: false}
})

/**
 * File System
 */
ipcMain.handle('files_tree', async (event, vaultFilePath: string) => {
	const senderContext = await getSenderContext(event)
	if (!senderContext.vault) {
		return {error: true, identifier: 'vault-not-open', message: 'Sender window has no vault open'}
	}
	const filePath = path_join(senderContext.vault.path, vaultFilePath)

	try {
		console.debug(`[files] tree - (${senderContext.id})[${senderContext.vault.path}] ${vaultFilePath}`)
		const result = await tree(senderContext.vault.path, filePath)
		return {error: false, result}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('files_glob', async (event, vaultFilePath: string, pattern: string) => {
	const senderContext = await getSenderContext(event)
	if (!senderContext.vault) {
		return {error: true, identifier: 'vault-not-open', message: 'Sender window has no vault open'}
	}
	const vaultPath = path_join(senderContext.vault.path, vaultFilePath)

	// todo: validate glob pattern, should be done in platform layer?
	try {
		console.debug(`[files] glob - (${senderContext.id})[${senderContext.vault.path}] ${vaultFilePath}`)
		const result = await glob(vaultPath, vaultFilePath, pattern)
		return {error: false, result}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('files_read', async (event, vaultFilePath: string) => {
	const senderContext = await getSenderContext(event)
	if (!senderContext.vault) {
		return {error: true, identifier: 'vault-not-open', message: 'Sender window has no vault open'}
	}
	const filePath = path_join(senderContext.vault.path, vaultFilePath)

	try {
		console.debug(`[files] read - (${senderContext.id})[${senderContext.vault.path}] ${vaultFilePath} `)
		const result = await read(filePath)
		return {error: false, result}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('files_readAsText', async (event, vaultFilePath: string) => {
	const senderContext = await getSenderContext(event)
	if (!senderContext.vault) {
		return {error: true, identifier: 'vault-not-open', message: 'Sender window has no vault open'}
	}
	const filePath = path_join(senderContext.vault.path, vaultFilePath)

	try {
		console.debug(`[files] readAsText - (${senderContext.id})[${senderContext.vault.path}] ${vaultFilePath}`)
		const result = await readAsText(filePath)
		return {error: false, result}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('files_stat', async (event, vaultFilePath: string) => {
	const senderContext = await getSenderContext(event)
	if (!senderContext.vault) {
		return {error: true, identifier: 'vault-not-open', message: 'Sender window has no vault open'}
	}
	const filePath = path_join(senderContext.vault.path, vaultFilePath)

	try {
		console.debug(`[files] stat - (${senderContext.id})[${senderContext.vault.path}] ${vaultFilePath}`)
		const result = await stat(filePath)
		return {error: false, result}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('files_readAsUrl', async (event, vaultFilePath: string) => {
	// todo: check that path is within a vault folder, or don't both as checks will be made by hb:// protocol anyway?

	const senderContext = await getSenderContext(event)
	if (!senderContext.vault) {
		return {error: true, identifier: 'vault-not-open', message: 'Sender window has no vault open'}
	}
	const filePath = path_join(senderContext.vault.path, vaultFilePath)

	try {
		console.debug(`[files] readAsUrl - (${senderContext.id})[${senderContext.vault.path}] ${vaultFilePath}`)
		const result = await readAsUrl(filePath)
		return {error: false, result}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('files_write', async (event, vaultFilePath: string, data: ArrayBuffer|Uint8Array) => {
	// todo: check that path is within a vault folder, or don't both as checks will be made by hb:// protocol anyway?

	const senderContext = await getSenderContext(event)
	if (!senderContext.vault) {
		return {error: true, identifier: 'vault-not-open', message: 'Sender window has no vault open'}
	}
	const filePath = path_join(senderContext.vault.path, vaultFilePath)

	try {
		console.debug(`[files] write - (${senderContext.id})[${senderContext.vault.path}] ${vaultFilePath}`)
		const result = await write(filePath, data)
		return {error: false, result}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('files_writeText', async (event, vaultFilePath: string, data: string) => {
	// todo: check that path is within a vault folder, or don't both as checks will be made by hb:// protocol anyway?

	const senderContext = await getSenderContext(event)
	if (!senderContext.vault) {
		return {error: true, identifier: 'vault-not-open', message: 'Sender window has no vault open'}
	}
	const filePath = path_join(senderContext.vault.path, vaultFilePath)

	try {
		console.debug(`[files] writeText - (${senderContext.id})[${senderContext.vault.path}] ${vaultFilePath}`)
		const result = await writeText(filePath, data)
		return {error: false, result}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})
