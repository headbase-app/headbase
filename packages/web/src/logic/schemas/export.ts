import {FieldDto} from "./fields/dtos.ts";
import {ContentTypeDto} from "./content-types/dtos.ts";
import {ContentItemDto} from "./content-items/dtos.ts";
import {ViewDto} from "./views/dtos.ts";
import {z} from "zod";
import {HEADBASE_VERSION} from "../headbase-web.ts";


export const DatabaseExport = z.object({
	exportVersion: z.literal("v1"),
	hbv: z.literal(HEADBASE_VERSION),
	createdAt: z.string().datetime(),
	data: z.object({
		fields: z.array(FieldDto),
		contentTypes: z.array(ContentTypeDto),
		contentItems: z.array(ContentItemDto),
		views: z.array(ViewDto)
	})
})

export type DatabaseExport = z.infer<typeof DatabaseExport>