import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'

import {getVaults} from './vaults/vaults'
import { versions } from './versions/versions'
import {Vault, VaultMap} from "../contracts/vaults";

// Override package.json name, ensures calls like `getPath` just use 'headbase'.
app.setName('headbase')
const USER_DATA_PATH = app.getPath('userData')

// Store the current vault each window has open.
// - Used to allow windows to open with a pre-selected vault.
// - Used as a security measure to restrict file system access of renderer IPC calls to the current vault folder.
const windowVaults = new Map<number, string>()

function createWindow(vaultId?: string): void {
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

ipcMain.handle('getCurrentVault', async (event) => {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (!senderWindow) {
		return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
	}

	const vaultId = windowVaults.get(senderWindow.id)
	if (vaultId) {
		const vaults = await getVaults(USER_DATA_PATH)
		const vault = vaults[vaultId]

		if (vault) {
			return {error: false, result: vault}
		}
		return {error: true, identifier: 'vault-not-found', message: 'Window has current vault which could not be found.'}
	}

	return {error: false, result: null}
})


ipcMain.handle('openVaultNewWindow', (event, vaultId: string) => {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (!senderWindow) {
		return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
	}

	createWindow(vaultId)
	return {error: false}
})

ipcMain.handle('openVault', (event, vaultId: string) => {
	const senderWindow = BrowserWindow.fromWebContents(event.sender);
	if (!senderWindow) {
		return {error: true, identifier: 'unidentified-window', message: 'Event could not be traced to sender window, ignoring request.'}
	}

	windowVaults.set(senderWindow.id, vaultId)
	return {error: false}
})

ipcMain.handle('getVersions', () => ({
	error: false,
	result: versions
}))

ipcMain.handle('getVaults', async () => {
	let vaults: VaultMap
	try {
		vaults = await getVaults(USER_DATA_PATH)
		return {error: false, result: vaults}
	}
	// todo: handle other errors?
	catch (e) {
		return {error: true, identifier: '', cause: e}
	}
})
