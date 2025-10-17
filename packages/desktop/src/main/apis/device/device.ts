import {Environment} from "../../../contracts/environment";

/**
 * Return name and version information about the current environment.
 */
export function getEnvironment(): Environment {
	return {
		name: process.platform,
		versions: [
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
		]
	}
}
