import {z} from "zod"

export const IdField = z.string().uuid()
export type IdField = z.infer<typeof IdField>

// IndexDB can't index boolean types (true, false) so 0 and 1 must be used instead.
export const BooleanField = z.union([z.literal(0), z.literal(1)])
export type BooleanField = z.infer<typeof BooleanField>

export const TimestampField = z.string().datetime()
export type TimestampField = z.infer<typeof TimestampField>
