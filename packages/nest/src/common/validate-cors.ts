import { CorsOptions } from "cors";
import { AccessCorsError } from "@services/errors/access/access-cors.error";
import { ConfigService } from "@services/config/config.service";

// todo: use types from cors?
type CorsCallback = (error: any, allow?: boolean) => void;

export function createCorsOptions(configService: ConfigService): CorsOptions {
	return {
		origin: (origin: string | undefined, callback: CorsCallback) => {
			// Only enable CORS checks in production mode
			if (configService.vars.general.environment !== "production") {
				return callback(null, true);
			}

			// Validate the origin header if passed, but also allow no origin so tooling outside the browser can still work.
			if (!origin || configService.vars.general.allowedOrigins.includes(origin)) {
				return callback(null, true);
			}

			callback(new AccessCorsError(), false);
		},
	};
}
