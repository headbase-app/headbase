import {z} from "zod";

export const PeerSentMessageSchema = z.discriminatedUnion("kind", [
    z.object({kind: z.literal("health/ping")}),
    z.object({kind: z.literal("health/pong")}),
    z.object({kind: z.literal("peers/discover")}),
    z.object({
        kind: z.literal("msg/all"),
        data: z.string(),
        meta: z.string().optional(),
        topics: z.array(z.string()).optional(),
    }),
    z.object({
        kind: z.literal("msg/dm"),
        to: z.array(z.uuidv4()),
        data: z.string(),
        meta: z.string().optional(),
    }),
    z.object({
        kind: z.literal("topics/subscribe"),
        topics: z.array(
            z.union([
                z.string(),
                z.array(z.string()),
            ])
        ),
    }),
    z.object({
        kind: z.literal("topics/unsubscribe"),
    }),
]);
export type PeerSentMessageSchema = z.infer<typeof PeerSentMessageSchema>

export const RelaySentMessageSchema = z.discriminatedUnion("kind", [
    z.object({kind: z.literal("health/ping")}),
    z.object({kind: z.literal("health/pong")}),
    z.object({
        kind: z.literal("peers/list"),
        peers: z.array(z.object({
            pid: z.uuidv4(),
            knownAs: z.string().nullable(),
        })),
    }),
    z.object({
        kind: z.literal("msg/all"),
        from: z.uuidv4(),
        data: z.string(),
        meta: z.string().optional(),
        topics: z.array(z.string()).optional(),
    }),
    z.object({
        kind: z.literal("msg/dm"),
        from: z.uuidv4(),
        to: z.array(z.uuidv4()),
        data: z.string(),
        meta: z.string().optional(),
    }),
]);
export type RelaySentMessageSchema = z.infer<typeof RelaySentMessageSchema>
