export type LoggerLevel = 'debug' | 'warn' | 'error'

declare global {
	// eslint-disable-next-line no-var -- need to use var for types to work correctly.
	var LOGGER_LEVEL: LoggerLevel;
}

// Define globally so this can be easily overwritten on any environment for live debugging if required.
globalThis.LOGGER_LEVEL = 'debug'

export class LoggerClass {
	debug(...args: any[]) {
		if (globalThis.LOGGER_LEVEL === 'debug') {
			console.debug(...args)
		}
	}

	warn(...args: any[]) {
		if (globalThis.LOGGER_LEVEL === 'debug' || globalThis.LOGGER_LEVEL === 'warn') {
			console.warn(...args)
		}
	}

	error(...args: any[]) {
		if (globalThis.LOGGER_LEVEL === 'debug' || globalThis.LOGGER_LEVEL === 'warn' || globalThis.LOGGER_LEVEL === 'error') {
			console.error(...args)
		}
	}
}

export const Logger = new LoggerClass();
