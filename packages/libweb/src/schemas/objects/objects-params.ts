import {z} from "zod";

export const ObjectsURLParams = z.object({
	objectId: z.uuid("objectId URL param must be a uuid"),
}).strict();
export type ObjectsURLParams = z.infer<typeof ObjectsURLParams>;
