import {
	CreateUserDto,
	ErrorIdentifiers,
	AuthUserResponse,
	ServerInfoDto,
	TokenPair,
	UpdateUserDto,
	UserDto, LoginRequest,
} from "@headbase-app/common";
import {ErrorTypes, HeadbaseError, LIVE_QUERY_LOADING_STATE, LiveQueryResult, LiveQueryStatus} from "../../control-flow.ts";
import {GeneralStorageService} from "../general-storage.service.ts";
import {z} from "zod";
import {Observable} from "rxjs";
import {AnyHeadbaseEvent, EventTypes} from "../events/events.ts";
import {LocalUserDto} from "../../schemas/user.ts";
import {DeviceContext, PlatformAdapter} from "../../../lib/headbase-core/adapter.ts";

export type SyncStatus = 'synced' | 'queued' | 'running' | 'error' | 'disabled'

export interface QueryOptions {
	serverUrl: string,
	path: string,
	method: 'GET'|'POST'|'PATCH'|'DELETE',
	data?: object,
	params?: URLSearchParams,
	noAuthRequired?: boolean,
	disableAuthRetry?: boolean
}

// todo: define somewhere else
export const LocalLoginRequest = LoginRequest.extend({
	serverUrl: z.string().url("must be a valid URL")
})
export type LocalLoginRequest = z.infer<typeof LocalLoginRequest>

export interface ServerAPIConfig {
	context: DeviceContext
	generalStorage: GeneralStorageService
	platformAdapter: PlatformAdapter
}


export class ServerAPI {
	readonly #context: DeviceContext
	readonly #generalStorage: GeneralStorageService
	readonly #platformAdapter: PlatformAdapter

	constructor(config: ServerAPIConfig) {
		this.#context = config.context
		this.#generalStorage = config.generalStorage
		this.#platformAdapter = config.platformAdapter
	}

	async #getServerUrl(): Promise<string> {
		const currentUser = await this.#generalStorage.loadCurrentUser()
		if (!currentUser) {
			throw new Error("no current user found while attempting to make request.")
		}

		return currentUser.serverUrl
	}

	// Basic Query
	private async query<ResponseType>(options: QueryOptions): Promise<ResponseType> {
		const headers: Headers = new Headers({"Content-Type": "application/json"})

		if (!options.noAuthRequired) {
			const accessToken = await this.#generalStorage.loadAccessToken();

			// This might be the first request of this session, so refresh auth to fetch a new access token and retry the request.
			if (!accessToken && !options.disableAuthRetry) {
				return this.refreshAuthAndRetry<ResponseType>(options)
			}

			headers.set("Authorization", `Bearer ${accessToken}`)
		}

		const url = options.params && Array.from(options.params.keys()).length > 0
			? `${options.serverUrl}${options.path}?${options.params.toString()}`
			: `${options.serverUrl}${options.path}`

		const response = await fetch(
			url,
			{
				method: options.method,
				body: JSON.stringify(options.data),
				headers
			});
		let responseData: unknown
		if (response.headers.get("content-type")?.includes("application/json")) {
			responseData = await response.json();
		}
		else {
			responseData = await response.text();
		}

		if (response.status === 200 || response.status === 201) {
			return responseData as ResponseType
		}
		// If the request failed due to ACCESS_UNAUTHORIZED, the access token may just have expired so refresh auth
		// and retry the request.
		// @ts-expect-error - todo: imporve typing?
		if (responseData?.identifier === ErrorIdentifiers.ACCESS_UNAUTHORIZED && !options.disableAuthRetry) {
			return this.refreshAuthAndRetry<ResponseType>(options)
		}

		throw new HeadbaseError({type: ErrorTypes.NETWORK_ERROR, devMessage: `There was an error with the request '${options.path} [${options.method}]`, originalError: responseData})
	}

	private async refreshAuthAndRetry<ResponseType>(options: QueryOptions): Promise<ResponseType> {
		await this.refresh();

		return this.query({
			...options,
			// Disable auth retry as we've already done that now.
			disableAuthRetry: true
		});
	}

	public async login(loginDetails: LocalLoginRequest) {
		const loginResult= await this.query<AuthUserResponse>({
			method: 'POST',
			serverUrl: loginDetails.serverUrl,
			path: `/v1/auth/login`,
			data: {
				email: loginDetails.email,
				password: loginDetails.password
			},
			noAuthRequired: true
		});

		const localUser = {
			serverUrl: loginDetails.serverUrl,
			...loginResult.user
		}

		await this.#generalStorage.saveCurrentUser(localUser)
		await this.#generalStorage.saveRefreshToken(loginResult.tokens.refreshToken)
		await this.#generalStorage.saveAccessToken(loginResult.tokens.accessToken)

		this.#platformAdapter.events.dispatch(EventTypes.USER_LOGIN, {
			context: this.#context,
			data: {
				serverUrl: loginDetails.serverUrl,
				user: localUser
			}
		})

		return loginResult;
	}

	public async register(serverUrl: string, createUserDto: CreateUserDto) {
		return await this.query<UserDto>({
			serverUrl,
			method: 'POST',
			path: `/v1/users`,
			data: createUserDto,
			noAuthRequired: true
		});
	}

	public async logout() {
		const currentUser = await this.#generalStorage.loadCurrentUser()
		if (!currentUser) {
			throw new Error('No current user found to logout')
		}

		const refreshToken = await this.#generalStorage.loadRefreshToken()
		if (!refreshToken) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: "No refreshToken found during logout"})
		}

		await this.query({
			serverUrl: currentUser.serverUrl,
			method: 'POST',
			path: `/v1/auth/logout`,
			noAuthRequired: true,
			data: {
				refreshToken,
			}
		});

		await this.#generalStorage.deleteCurrentUser()
		await this.#generalStorage.deleteAccessToken()
		await this.#generalStorage.deleteRefreshToken()

		this.#platformAdapter.events.dispatch(EventTypes.USER_LOGOUT, {
			context: this.#context,
		})
	}

	public async refresh() {
		const refreshToken = await this.#generalStorage.loadRefreshToken()
		if (!refreshToken) {
			throw new HeadbaseError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: "No refreshToken found during auth refresh"})
		}
		const serverUrl = await this.#getServerUrl()

		let tokens: TokenPair;
		try {
			tokens = await this.query({
				serverUrl,
				method: 'POST',
				path: `/v1/auth/refresh`,
				noAuthRequired: true,
				data: {
					refreshToken,
				}
			});

			await this.#generalStorage.saveAccessToken(tokens.accessToken)
			await this.#generalStorage.saveRefreshToken(tokens.refreshToken)
		}
		catch(e: unknown) {
			// Delete all user data if the session is no longer valid
			// @ts-expect-error -- todo: improve typing of errors?
			if (e.response?.data?.identifier === ErrorIdentifiers.ACCESS_UNAUTHORIZED) {
				await this.#generalStorage.deleteRefreshToken()
				await this.#generalStorage.deleteAccessToken()
			}

			throw e;
		}
	}

	// Info
	async getInfo(serverUrl: string) {
		return this.query<ServerInfoDto>({
			serverUrl,
			method: 'GET',
			path: `/v1/info`,
			noAuthRequired: true
		});
	}

	// Users
	async fetchUser(userId: string) {
		const serverUrl = await this.#getServerUrl()
		// todo: should not rely on current user server?

		return this.query<UserDto>({
			serverUrl,
			method: 'GET',
			path: `/v1/users/${userId}`,
		});
	}

	async deleteUser(userId: string) {
		const serverUrl = await this.#getServerUrl()
		// todo: should not rely on current user server?

		return this.query<void>({
			serverUrl,
			method: 'DELETE',
			path: `/v1/users/${userId}`,
		});
	}

	async updateUser(userId: string, update: UpdateUserDto) {
		const serverUrl = await this.#getServerUrl()
		// todo: should not rely on current user server?

		return this.query<UserDto>({
			serverUrl,
			method: 'PATCH',
			path: `/v1/users/${userId}`,
			data: update
		});
	}

	getCurrentUser(): Promise<LocalUserDto|null> {
		return this.#generalStorage.loadCurrentUser()
	}

	liveGetCurrentUser() {
		return new Observable<LiveQueryResult<LocalUserDto|null>>((subscriber) => {
			subscriber.next(LIVE_QUERY_LOADING_STATE)

			const runQuery = async () => {
				subscriber.next(LIVE_QUERY_LOADING_STATE)

				try {
					const user = await this.getCurrentUser()
					subscriber.next({status: LiveQueryStatus.SUCCESS, result: user})
				}
				catch (e) {
					subscriber.next({status: LiveQueryStatus.ERROR, errors: [e]})
				}
			}

			const handleEvent = (e: AnyHeadbaseEvent) => {
				if (e.type === EventTypes.USER_LOGIN || e.type === EventTypes.USER_LOGOUT) {
					runQuery()
				}
			}

			this.#platformAdapter.events.subscribe(EventTypes.USER_LOGIN, handleEvent)
			this.#platformAdapter.events.subscribe(EventTypes.USER_LOGOUT, handleEvent)

			// Run initial query
			runQuery()

			return () => {
				this.#platformAdapter.events.unsubscribe(EventTypes.USER_LOGIN, handleEvent)
				this.#platformAdapter.events.subscribe(EventTypes.USER_LOGOUT, handleEvent)
			}
		})
	}
}
