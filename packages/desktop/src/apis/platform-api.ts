import {IDeviceAPI, IVaultsAPI, IWorkspaceVaultAPI, IFilesAPI} from "@headbase-app/lib"

export type PlatformResponse<T> = {
	error: false,
	result: T
} | {
	error: true,
	identifier: string
	cause: unknown
}

// todo: move to lib
export interface EnvironmentVersion {
	name: string
	version: string
}
export interface Environment {
	name: string
	versions: EnvironmentVersion[]
}

// Helper type to transform an API method into a platform response.
export type AsPlatformMethod<T extends (...a: any) => any> = (...a: Parameters<T>) => Promise<PlatformResponse<Awaited<ReturnType<T>>>>;

export interface IPlatformAPI {
	// DeviceAPI
	device_getCurrentContext: AsPlatformMethod<IDeviceAPI['getCurrentContext']>
	device_getIdentity: AsPlatformMethod<IDeviceAPI['getIdentity']>
	// VaultsAPI
	vaults_selectLocation: AsPlatformMethod<IVaultsAPI['selectLocation']>
	vaults_create: AsPlatformMethod<IVaultsAPI['create']>
	vaults_update: AsPlatformMethod<IVaultsAPI['update']>
	vaults_delete: AsPlatformMethod<IVaultsAPI['delete']>
	vaults_get: AsPlatformMethod<IVaultsAPI['get']>
	vaults_query: AsPlatformMethod<IVaultsAPI['query']>
	//IWorkspaceVaultAPI
	workspaceVault_get: AsPlatformMethod<IWorkspaceVaultAPI['get']>
	workspaceVault_close: AsPlatformMethod<IWorkspaceVaultAPI['close']>
	workspaceVault_open: AsPlatformMethod<IWorkspaceVaultAPI['open']>
	workspaceVault_openNewContext: AsPlatformMethod<IWorkspaceVaultAPI['openNewContext']>
	// FilesAPI
	files_ls: AsPlatformMethod<IFilesAPI['ls']>
	files_tree: AsPlatformMethod<IFilesAPI['tree']>
	files_mv: AsPlatformMethod<IFilesAPI['mv']>
	files_cp: AsPlatformMethod<IFilesAPI['cp']>
	files_rm: AsPlatformMethod<IFilesAPI['rm']>
	files_mkdir: AsPlatformMethod<IFilesAPI['mkdir']>
	files_read: AsPlatformMethod<IFilesAPI['read']>
	files_readAsText: AsPlatformMethod<IFilesAPI['readAsText']>
	files_readAsUrl: AsPlatformMethod<IFilesAPI['readAsUrl']>
	files_write: AsPlatformMethod<IFilesAPI['write']>
	files_writeText: AsPlatformMethod<IFilesAPI['writeText']>
}

declare global {
	interface Window {
		platformAPI: IPlatformAPI
	}
}
