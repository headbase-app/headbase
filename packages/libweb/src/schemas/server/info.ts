import {z} from "zod";

export const ServerInfoDto = z.object({
  version: z.string(),
  registrationEnabled: z.boolean(),
}).strict()
export type ServerInfoDto = z.infer<typeof ServerInfoDto>;
