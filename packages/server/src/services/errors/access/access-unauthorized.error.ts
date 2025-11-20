import { AccessError } from "./access.error.js";

/**
 * For use when a party is unauthorized (not authenticated) and is not allowed access to a resource without authentication.
 */
export class AccessUnauthorizedError extends AccessError {}
