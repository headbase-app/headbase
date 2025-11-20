import { RequestContext } from "./request-context.js";

/**
 * There is no absolute guarantee that the context will
 * be processed for every route, so null must be an option.
 */
export interface SocketWithContext extends WebSocket {
	context: RequestContext | null;
}
