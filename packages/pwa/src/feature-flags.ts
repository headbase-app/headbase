export interface FeatureFlags {
	debug_sqlite: boolean;
	debug_opfs: boolean;
}

declare global {
	interface Window {
		FLAGS: FeatureFlags,
	}
}

export function featureFlags(): FeatureFlags {
	if (!window.FLAGS) {
		window.FLAGS = {
			debug_sqlite: import.meta.env.VITE_FEATURE_FLAGS?.includes('debug_sqlite') || false,
			debug_opfs: import.meta.env.VITE_FEATURE_FLAGS?.includes('debug_opfs') || false,
		}
	}
	return window.FLAGS
}
