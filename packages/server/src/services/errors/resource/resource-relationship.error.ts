import { ResourceError } from "./resource.error.js";

/**
 * For when a resource relationship is invalid.
 *
 * For example when trying to add new content to a database
 * and a foreign key reference fails because the other entity doesn't exist.
 */
export class ResourceRelationshipError extends ResourceError {}
