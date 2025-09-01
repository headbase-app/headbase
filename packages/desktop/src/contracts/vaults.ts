export interface Vault {
	id: string
	path: string
	displayName: string
}

export type CreateVaultDto = Pick<Vault,  'path' | 'displayName'>

export type UpdateVaultDto = Pick<Vault, 'displayName'>
