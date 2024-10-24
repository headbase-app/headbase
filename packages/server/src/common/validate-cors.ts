import {EnvironmentService} from "@services/environment/environment.service.js";
import {CorsOptions} from "cors";
import {AccessCorsError} from "@services/errors/access/access-cors.error.js";

// todo: use types from cors?
type CorsCallback = (error: any, allow?: boolean) => void

export function createCorsOptions(envService: EnvironmentService): CorsOptions {
    return {
        origin: (origin: string | undefined, callback: CorsCallback) => {
            // Only enable CORS checks in production mode
            if (envService.vars.general.environment !== "production") {
                return callback(null, true)
            }

            // Validate the origin header if passed, but also allow no origin so tooling outside the browser can still work.
            if (!origin || envService.vars.general.allowedOrigins.includes(origin)) {
                return callback(null, true)
            }

            callback(new AccessCorsError(), false)
        }}
}
