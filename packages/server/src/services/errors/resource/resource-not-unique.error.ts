import { ResourceError } from "./resource.error.js";

/**
 * For when a resource is not unique or would become not unique.
 *
 * For example when new content to be added to a database
 * fails a uniqueness constraint.
 */
export class ResourceNotUniqueError extends ResourceError {}
