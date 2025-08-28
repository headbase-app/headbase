import {join} from "pathe";

/**
 * Join paths
 *
 * @param parts
 */
export function joinPathParts(...parts: string[]): string {
	return join(...parts)
}
