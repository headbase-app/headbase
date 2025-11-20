import { UserRequestError } from "../base/user-request.error.js";

/**
 * A subset of UserError specifically for access related errors
 * such as access denied, forbidden etc.
 */
export class AccessError extends UserRequestError {}
