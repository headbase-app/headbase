import { Version } from '../../contracts/version'

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
] as const satisfies Version[]
