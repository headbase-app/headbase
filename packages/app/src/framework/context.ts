import {createContext} from "@lit/context";
import {CurrentVaultAPI} from "@api/current-vault/current-vault.api.ts";
import {VaultsAPI} from "@api/vaults/vaults.api.ts";
import {I18nAPI} from "@api/i18n/i18n.api.ts";

export const currentVaultAPIContext = createContext<CurrentVaultAPI>('currentVaultAPI');
export const vaultsAPIContext = createContext<VaultsAPI>('vaultsAPI');
export const i18nAPIContext = createContext<I18nAPI>('i18nAPI');
