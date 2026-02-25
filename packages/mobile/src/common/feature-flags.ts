export interface FeatureFlags {
	debug_sqlite: boolean;
	debug_fs: boolean;
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
			debug_fs: import.meta.env.VITE_FEATURE_FLAGS?.includes('debug_fs') || false,
		}
	}
	return window.FLAGS
}
