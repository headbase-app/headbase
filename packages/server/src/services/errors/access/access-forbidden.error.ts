import { AccessError } from "./access.error";

/**
 * For use when a party is authorized (authenticated) but is not allowed access to a resource.
 */
export class AccessForbiddenError extends AccessError {}
