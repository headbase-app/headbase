import {z} from "zod";

export const ServerInfoDto = z.object({
  version: z.string(),
  registrationEnabled: z.boolean(),
  limits: z.object({
    vaultsPerUser: z.number().int(),
    vaultSize: z.number().int(),
    contentSize: z.number().int(),
  })
}).strict()
export type ServerInfoDto = z.infer<typeof ServerInfoDto>;
