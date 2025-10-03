export interface EnvironmentVersion {
	name: string
	version: string
}

export interface Environment {
	name: string
	versions: EnvironmentVersion[]
}
