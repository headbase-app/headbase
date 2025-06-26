import {z} from "zod";
import {HistoryItemDto} from "@headbase-app/common";

export const LocalHistoryItemDto = HistoryItemDto.omit({vaultId: true})
export type LocalHistoryItemDto = z.infer<typeof LocalHistoryItemDto>;
