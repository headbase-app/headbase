/// <reference types="vite/client" />

import {LoggerLevel} from "./utils/logger";

interface ImportMetaEnv {
	readonly VITE_DEFAULT_SERVER_URL: string;
	readonly VITE_LOGGER_LEVEL: LoggerLevel;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
