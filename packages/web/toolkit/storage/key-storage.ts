
// todo: save to sessionStorage or persist only via memory and broadcast channel?

export class KeyStorage {
	private static getStorageKey(id: string) {
		return `enckey_${id}`
	}
    
	static async get(id: string) {
		return localStorage.getItem(KeyStorage.getStorageKey(id))
	}

	static async set(id: string, key: string) {
		localStorage.setItem(KeyStorage.getStorageKey(id), key)
	}

	static async delete(id: string) {
		localStorage.removeItem(KeyStorage.getStorageKey(id))
	}
}
