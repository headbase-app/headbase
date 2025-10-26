import {z} from "zod";

export const ServerInfoDto = z.object({
  version: z.string(),
  registrationEnabled: z.boolean(),
  limits: z.object({
    usersMaxVaults: z.number().int(),
    vaultMaxSize: z.number().int(),
    fileMaxSize: z.number().int(),
  })
}).strict()
export type ServerInfoDto = z.infer<typeof ServerInfoDto>;
