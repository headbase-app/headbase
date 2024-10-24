import {
	CreateUserDto,
	ErrorIdentifiers,
	LoginRequest,
	AuthUserResponse,
	ServerInfoDto,
	TokenPair,
	UpdateUserDto,
	UserDto,
} from "@headbase-app/common";
import {ErrorTypes, LocalfulError} from "../control-flow";
import {GeneralStorage} from "@headbase-toolkit/storage/general-storage";

export interface QueryOptions {
	url: string,
	method: 'GET'|'POST'|'PATCH'|'DELETE',
	data?: object,
	params?: URLSearchParams,
	noAuthRequired?: boolean,
	disableAuthRetry?: boolean
}

export interface ServerClientConfig {
	serverUrl: string;
	generalStorage: GeneralStorage;
}

export class ServerHTTPClient {
	private readonly serverUrl: string;
	private readonly generalStorage: GeneralStorage;

	constructor(config: ServerClientConfig) {
		this.serverUrl = config.serverUrl;
		this.generalStorage = config.generalStorage;
	}

	// Basic Query
	private async query<ResponseType>(options: QueryOptions): Promise<ResponseType> {
		const headers: Headers = new Headers({"Content-Type": "application/json"})

		if (!options.noAuthRequired) {
			const accessToken = await this.generalStorage.loadAccessToken();

			// This might be the first request of this session, so refresh auth to fetch a new access token and retry the request.
			if (!accessToken && !options.disableAuthRetry) {
				return this.refreshAuthAndRetry<ResponseType>(options)
			}

			headers.set("Authorization", `Bearer ${accessToken}`)
		}

		const url =
            options.params && Array.from(options.params.keys()).length > 0
            	? `${this.serverUrl}${options.url}?${options.params.toString()}`: `${this.serverUrl}${options.url}`


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

		throw new LocalfulError({type: ErrorTypes.NETWORK_ERROR, devMessage: `There was an error with the request '${options.url} [${options.method}]`, originalError: responseData})
	}

	private async refreshAuthAndRetry<ResponseType>(options: QueryOptions): Promise<ResponseType> {
		await this.refresh();

		return this.query({
			...options,
			// Disable auth retry as we've already done that now.
			disableAuthRetry: true
		});
	}

	public async login(data: LoginRequest) {
		const loginResult= await this.query<AuthUserResponse>({
			method: 'POST',
			url: `/v1/auth/login`,
			data,
			noAuthRequired: true
		});

		if (loginResult.tokens) {
			await this.generalStorage.saveRefreshToken(loginResult.tokens.refreshToken)
			await this.generalStorage.saveAccessToken(loginResult.tokens.accessToken)
		}

		return loginResult;
	}

	public async register(createUserDto: CreateUserDto) {
		return await this.query<UserDto>({
			method: 'POST',
			url: `/v1/users`,
			data: createUserDto,
			noAuthRequired: true
		});
	}

	public async logout() {
		const refreshToken = await this.generalStorage.loadRefreshToken()
		if (!refreshToken) {
			throw new LocalfulError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: "No refreshToken found during logout"})
		}

		await this.query({
			method: 'POST',
			url: `/v1/auth/logout`,
			noAuthRequired: true,
			data: {
				refreshToken,
			}
		});

		await this.generalStorage.deleteAccessToken()
		await this.generalStorage.deleteRefreshToken()
	}

	public async refresh() {
		const refreshToken = this.generalStorage.loadRefreshToken()
		if (!refreshToken) {
			throw new LocalfulError({type: ErrorTypes.INVALID_OR_CORRUPTED_DATA, devMessage: "No refreshToken found during auth refresh"})
		}

		let tokens: TokenPair;
		try {
			tokens = await this.query({
				method: 'POST',
				url: `/v1/auth/refresh`,
				noAuthRequired: true,
				data: {
					refreshToken,
				}
			});

			await this.generalStorage.saveAccessToken(tokens.accessToken)
			await this.generalStorage.saveRefreshToken(tokens.refreshToken)
		}
		catch(e: any) {
			// Delete all user data if the session is no longer valid
			if (e.response?.data?.identifier === ErrorIdentifiers.ACCESS_UNAUTHORIZED) {
				await this.generalStorage.deleteRefreshToken()
				await this.generalStorage.deleteAccessToken()
			}

			throw e;
		}
	}

	// Info
	async getInfo() {
		return this.query<ServerInfoDto>({
			method: 'GET',
			url: `/v1/info`,
			noAuthRequired: true
		});
	}

	// Users
	async getUser(userId: string) {
		return this.query<UserDto>({
			method: 'GET',
			url: `/v1/users/${userId}`,
		});
	}

	async deleteUser(userId: string) {
		return this.query<void>({
			method: 'DELETE',
			url: `/v1/users/${userId}`,
		});
	}

	async updateUser(userId: string, update: UpdateUserDto) {
		return this.query<UserDto>({
			method: 'PATCH',
			url: `/v1/users/${userId}`,
			data: update
		});
	}
}
