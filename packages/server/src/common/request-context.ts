import { Request } from "express";
import {Permissions} from "@headbase-app/contracts";

/**
 * User details to be included in the request.
 */
export interface RequestUser {
  id: string;
  sessionId: string;
  verifiedAt: string | null;
  permissions: Permissions[]
}

/**
 * The user context may be nothing in the case of an anonymous request, hence null is an option.
 */
export type UserContext = RequestUser;

export interface RequestContext {
  user: UserContext
}

/**
 * There is no absolute guarantee that the context will
 * be processed for every route, so null must be an option.
 */
export interface RequestWithContext extends Request {
  context: RequestContext
}
