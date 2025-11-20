import { AccessError } from "./access.error.js";

/**
 * For use when the request has not passed CORS checks.
 */
export class AccessCorsError extends AccessError {}
