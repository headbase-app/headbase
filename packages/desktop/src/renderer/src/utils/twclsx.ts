import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * A helper function which combined clsx() and twMerge() to merge classNames.
 */
export function twclsx(...classes: ClassValue[]) {
	return twMerge(clsx(classes))
}
