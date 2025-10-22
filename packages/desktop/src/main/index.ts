import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { installExtension, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import Watcher from "watcher";

// @ts-ignore -- Required to support ESM module (https://github.com/fabiospampinato/watcher/issues/26)
const WatcherClass: Watcher = Watcher.default

import icon from '../../resources/icon.png?asset'

import {CreateVaultDto, UpdateVaultDto} from "../contracts/vaults";

import { getEnvironment } from './apis/device/device'
import {createVault, deleteVault, getVault, queryVaults, updateVault} from './apis/vaults/vaults'
import {getDirectoryTree, readFile, writeFile} from "./apis/files";

// Override package.json name, ensures calls like `getPath` just use 'headbase'.
app.setName('headbase')
const USER_DATA_PATH = app.getPath('userData')

// Store the current vault each window has open.
// - Used to allow windows to open with a pre-selected vault.
// - Used as a security measure to restrict file system access of renderer IPC calls to the current vault folder.
const windowVaults = new Map<number, string>()

// Store vault file system listeners.
// vaultId: watcher
const vaultListeners = new Map<string, Watcher>()

async function openVault(windowId: number, vaultId: string) {
	const vault = await getVault(USER_DATA_PATH, vaultId)
	if (!vault) {
		// todo: throw instead?
		return {error: true, identifier: 'vault-not-found', message: 'Window has current vault which could not be found.'}
	}

	windowVaults.set(windowId, vault.id)

	const existingListener = vaultListeners.get(vault.id)
	if (!existingListener) {
		const watcher = new WatcherClass(vault.path, {
			renameDetection: true,
			recursive: true,
			ignoreInitial: true,
			ignore: (path) => {
				// Ignore headbase internal dir
				if (path.endsWith('.headbase')) return true
				// Ignore OS specific management files
				if (path.endsWith('.DS_Store')) return true
				return false
			}
		})
		watcher.on('all', ( event, targetPath, targetPathNext ) => {
			console.debug(event, targetPath, targetPathNext)
			const windows = BrowserWindow.getAllWindows();
			for (const window of windows) {
				const openVault = windowVaults.get(window.id)
				if (openVault === vault.id) {
					if (event === 'add' || event === 'addDir') {
						window.webContents.send('vault_fs_change', {event: 'add', path: targetPath})
					}
					else if (event === 'rename' || event === 'renameDir') {
						window.webContents.send('vault_fs_change', {event: 'rename', path: targetPathNext, previousPath: targetPath})
					}
					else if (event === 'unlink' || event === 'unlinkDir') {
						window.webContents.send('vault_fs_change', {event: 'delete', path: targetPath})
					}
					else {
						window.webContents.send('vault_fs_change', {event: 'change', path: targetPath})
					}
				}
			}
		});
		vaultListeners.set(vault.id, watcher)
	}
}

async function closeVault(windowId: number, vaultId: string) {
	windowVaults.delete(windowId)

	const openVaults = Array.from(windowVaults.values())
	if (!openVaults.includes(vaultId)) {
		const listener = vaultListeners.get(vaultId)
		if (listener) {
			listener.close()
			vaultListeners.delete(vaultId)
		}
	}
}

async function createWindow(vaultId?: string) {
	// Create a window, hidden by default
	const window = new BrowserWindow({
		show: false,
		titleBarStyle: 'hidden',
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
			preload: join(__dirname, '../preload/index.js')
		}
	})

	// Ensure open vault status is up to date.
	if (vaultId) {
		await openVault(window.id, vaultId)
	}
	else if (windowVaults.has(window.id)) {
		windowVaults.delete(window.id)
	}

	// Delay showing the window until it is ready.
	window.on('ready-to-show', () => {
		window.show()
	})

	installExtension([REACT_DEVELOPER_TOOLS])
		.then(([react]) => console.log(`Added dev tools extensions: ${react.name}`))
		.catch((err) => console.log('An error occurred adding dev tool extensions:: ', err));
	window.webContents.openDevTools()

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

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (process.env['ELECTRON_RENDERER_URL']) {
		window.loadURL(process.env['ELECTRON_RENDERER_URL'])
	} else {
		window.loadFile(join(__dirname, '../renderer/index.html'))
	}
}

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
})

// Quit when all windows are closed, except on macOS where it's common for apps and their menu bar to stay active until quit explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

/**
 * DeviceAPI
 */
ipcMain.handle('device_getEnvironment', () => {
	return {
		error: false,
		result: getEnvironment()
	}
})

/**
 * VaultsAPI
 */
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

/**
 * CurrentVaultAPI
 */
ipcMain.handle('currentVault_get', async (event) => {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (!senderWindow) {
		return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
	}

	const vaultId = windowVaults.get(senderWindow.id)
	if (!vaultId) {
		return {error: false, result: null}
	}

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

ipcMain.handle('currentVault_close', async (event) => {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (!senderWindow) {
		return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
	}

	const vaultId = windowVaults.get(senderWindow.id)
	if (!vaultId) {
		return {error: true, identifier: 'no-open-vault', message: 'Window has no current vault open, so unable to close.'}
	}

	// todo: error handle
	await closeVault(senderWindow.id, vaultId)
	return {error: false}
})

ipcMain.handle('currentVault_open', async (event, vaultId: string) => {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (!senderWindow) {
		return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
	}

	// todo: error handle
	await openVault(senderWindow.id, vaultId)

	return {error: false}
})

ipcMain.handle('currentVault_openNewWindow', (event, vaultId: string) => {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (!senderWindow) {
		return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
	}

	createWindow(vaultId)
	return {error: false}
})

/**
 * FilesAPI
 */
ipcMain.handle('files_tree', async (event) => {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (!senderWindow) {
		return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
	}
	const vaultId = windowVaults.get(senderWindow.id)
	if (!vaultId) {
		return {error: true, identifier: 'no-open-vault', message: 'Window has no current vault open, so unable to fulfill request.'}
	}
	const vault = await getVault(USER_DATA_PATH, vaultId)
	if (!vault) {
		return {error: true, identifier: 'vault-not-found', message: 'Current open vault not found.'}
	}

	try {
		const result = await getDirectoryTree(vault.path)
		return {error: false, result}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('files_read', async (event, filePath: string) => {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (!senderWindow) {
		return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
	}
	const vaultId = windowVaults.get(senderWindow.id)
	if (!vaultId) {
		return {error: true, identifier: 'no-open-vault', message: 'Window has no current vault open, so unable to fulfill request.'}
	}
	const vault = await getVault(USER_DATA_PATH, vaultId)
	if (!vault) {
		return {error: true, identifier: 'vault-not-found', message: 'Current open vault not found.'}
	}

	try {
		const result = await readFile(vault.path, filePath)
		return {error: false, result}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('files_write', async (event, filePath: string, data: ArrayBuffer) => {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (!senderWindow) {
		return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
	}
	const vaultId = windowVaults.get(senderWindow.id)
	if (!vaultId) {
		return {error: true, identifier: 'no-open-vault', message: 'Window has no current vault open, so unable to fulfill request.'}
	}
	const vault = await getVault(USER_DATA_PATH, vaultId)
	if (!vault) {
		return {error: true, identifier: 'vault-not-found', message: 'Current open vault not found.'}
	}

	try {
		const result = await writeFile(vault.path, filePath, data)
		return {error: false, result}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})

ipcMain.handle('files_open_external', async (event, filePath: string) => {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (!senderWindow) {
		return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
	}
	const vaultId = windowVaults.get(senderWindow.id)
	if (!vaultId) {
		return {error: true, identifier: 'no-open-vault', message: 'Window has no current vault open, so unable to fulfill request.'}
	}
	const vault = await getVault(USER_DATA_PATH, vaultId)
	if (!vault) {
		return {error: true, identifier: 'vault-not-found', message: 'Current open vault not found.'}
	}

	try {
		const platformFilePath = join(vault.path, filePath)
		await shell.openPath(platformFilePath)
		return {error: false}
	}
	catch (e) {
		return {error: true, identifier: 'system-error', message: 'An unexpected error occurred', cause: e}
	}
})
