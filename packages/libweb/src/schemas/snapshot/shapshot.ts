import {z} from "zod";

export const SnapshotDto = z.record(z.string(), z.boolean())
