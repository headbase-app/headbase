import {z} from "zod";
import {CreateQueryRequestSchema} from "./create.queries.request";

export const UpdateQueryRequestSchema = CreateQueryRequestSchema.partial().strict();

export type UpdateQueryRequest = z.infer<typeof UpdateQueryRequestSchema>;