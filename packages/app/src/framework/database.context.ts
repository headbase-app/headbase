import {createContext, useContext} from "solid-js";
import type {HeadbaseDatabase} from "@api/database/db.ts";

export const DatabaseContext = createContext<HeadbaseDatabase|null>(null);

export const useDatabase= () => useContext(DatabaseContext)
