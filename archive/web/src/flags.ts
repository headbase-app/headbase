
export interface FeatureFlags {
	debug_sqlite: boolean
	debug_file_system: boolean
}

export function featureFlags(): FeatureFlags {
	if (!globalThis.FLAGS) {
		globalThis.FLAGS = {
			debug_sqlite: import.meta.env.VITE_FEATURE_FLAGS?.includes('debug_sqlite') || false,
			debug_file_system: import.meta.env.VITE_FEATURE_FLAGS?.includes('debug_file_system') || false,
		}
	}

	return globalThis.FLAGS
}
