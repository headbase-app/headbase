import { loadEnvFile } from 'node:process';
loadEnvFile();

export interface Config {
	server: {
		port: number;
	},
	relay: {
		serverVersion: string;
		accessSecret: string | null;
		connectionCheckInterval: number;
	}
}
export type ConfigOverride = Partial<{server: Partial<Config['server']>, relay: Partial<Config['relay']>}>

export class ConfigService {
	#vars?: Config;

	constructor(
		private configOverride?: ConfigOverride
	) {}

	config() {
		if (this.#vars) return this.#vars;

		// todo: parse/validate variables before using
		const PORT = parseInt(process.env.PORT as string) || 8080
		const ACCESS_SECRET = process.env.ACCESS_SECRET || null
		const SERVER_VERSION = "v1.0"
		const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : ["*"]
		const CONNECTION_CHECK_INTERVAL = parseInt(process.env.CONNECTION_CHECK_INTERVAL as string) || 30000

		this.#vars = {
			server: {
				port: PORT,
				...(this.configOverride ? this.configOverride.server : {}),
			},
			relay: {
				serverVersion: SERVER_VERSION,
				accessSecret: ACCESS_SECRET,
				connectionCheckInterval: CONNECTION_CHECK_INTERVAL,
				...(this.configOverride ? this.configOverride.relay : {}),
			}
		}

		return this.#vars;
	}
}
