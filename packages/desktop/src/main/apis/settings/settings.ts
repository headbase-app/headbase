import { Settings } from '../../contracts/settings'

export function loadSettings(dataPath: string): Settings {
	console.debug(dataPath)
	return {
		serverUrl: null
	}
}

export function saveSettings(dataPath: string, settings: Settings) {
	console.debug(dataPath, settings)
	return
}
