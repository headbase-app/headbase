import {fields, fieldsVersions} from "./tables/fields.ts";
import {contentTypes, contentTypesVersions} from "./tables/content-types.ts";
import {contentItems, contentItemsVersions} from "./tables/content-items.ts";
import {views, viewsVersions} from "./tables/views.ts";

export const DatabaseSchema = {
	fields, fieldsVersions,
	contentTypes, contentTypesVersions,
	contentItems, contentItemsVersions,
	views, viewsVersions,
} as const
