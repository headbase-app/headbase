/**
 * The "identity" of the given device, providing a stable id and optional user-defined
 * device name for the lifetime of the application.
 *
 * This is useful in situations like sync history, where it can be useful to know what
 * device made a given change.
 */
export interface DeviceIdentity {
	id: string
	name?: string
}

/**
 * A device "context", which is a unique instance of the running application (for example,
 * each tab and/or window is a difference context).
 *
 * This is useful when handling events and cross-context communications between difference
 * tabs/windows running at the same time.
 */
export interface DeviceContext {
	id: string
}

export interface IDeviceService {
	getDeviceIdentity(): DeviceIdentity
	getCurrentContext(): DeviceContext
}
