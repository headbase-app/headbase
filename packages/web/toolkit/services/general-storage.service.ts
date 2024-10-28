import * as z from "zod"
import {LocalUserDto} from "../schemas/user";


export class GeneralStorageService {
	SERVER_URL_KEY = 'lf_server_url';
	CURRENT_USER_KEY = 'lf_current_user';
	HAS_STORAGE_PERMISSIONS_KEY = 'lf_has_storage_permissions';

	ACCESS_TOKEN_KEY = 'lf_access_token';
	REFRESH_TOKEN_KEY = 'lf_refresh_token';

	private async _loadLocalStorageData<Schema>(key: string, schema: z.ZodType<Schema>): Promise<Schema|null> {
		const rawString = localStorage.getItem(key);
		if (rawString) {
			try {
				const rawObject = JSON.parse(rawString);
				return schema.parse(rawObject.value)
			}
			catch (e) {
				console.error(`General storage item ${key} failed validation`)
				console.error(e)
				return null;
			}
		}

		return null;
	}

	private async _saveLocalStorageData(key: string, data: unknown): Promise<void> {
		// Always wrap value with json object so JSON.parse can be used consistently when loading data.
		localStorage.setItem(key, JSON.stringify({value: data}));
	}

	private async _deleteLocalStorageData(key: string): Promise<void> {
		localStorage.removeItem(key);
	}

	async loadCurrentUser(): Promise<LocalUserDto|null> {
		return this._loadLocalStorageData<LocalUserDto>(this.CURRENT_USER_KEY, LocalUserDto)
	}
	async saveCurrentUser(user: LocalUserDto) {
		return this._saveLocalStorageData(this.CURRENT_USER_KEY, user)
	}
	async deleteCurrentUser() {
		return this._deleteLocalStorageData(this.CURRENT_USER_KEY)
	}

	async loadStoragePermissions(): Promise<boolean> {
		return await this._loadLocalStorageData(this.HAS_STORAGE_PERMISSIONS_KEY, z.boolean()) ?? false
	}
	async saveStoragePermissions(value: boolean): Promise<void> {
		return this._saveLocalStorageData(this.HAS_STORAGE_PERMISSIONS_KEY, value)
	}
	
	async loadAccessToken(): Promise<string|null> {
		return this._loadLocalStorageData<string>(this.ACCESS_TOKEN_KEY, z.string())
	}
	async saveAccessToken(token: string) {
		return this._saveLocalStorageData(this.ACCESS_TOKEN_KEY, token)
	}
	async deleteAccessToken() {
		return this._deleteLocalStorageData(this.ACCESS_TOKEN_KEY)
	}

	async loadRefreshToken(): Promise<string|null> {
		return this._loadLocalStorageData<string>(this.REFRESH_TOKEN_KEY, z.string())
	}
	async saveRefreshToken(token: string) {
		return this._saveLocalStorageData(this.REFRESH_TOKEN_KEY, token)
	}
	async deleteRefreshToken() {
		return this._deleteLocalStorageData(this.REFRESH_TOKEN_KEY)
	}
}
