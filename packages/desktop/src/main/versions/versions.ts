import { Environment } from '../../contracts/environment'

export const versions = [
	{
		name: 'Node',
		version: process.versions.node
	},
	{
		name: 'Chrome',
		version: process.versions.chrome
	},
	{
		name: 'Electron',
		version: process.versions.electron
	}
] as const satisfies Environment[]
