/// <reference types="vite/client" />

interface ViteTypeOptions {
	// Make the type of ImportMetaEnv strict to disallow unknown keys.
	strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
	readonly VITE_FEATURE_FLAGS?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
