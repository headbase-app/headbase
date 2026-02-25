import {type PropsWithChildren} from "react";
import {DependencyContext} from "./dependency.context";

export interface DependencyProviderProps extends PropsWithChildren, DependencyContext {}

export function DependencyProvider({children, ...apis}: DependencyProviderProps) {
	return (
		<DependencyContext.Provider value={apis}>
			{children}
		</DependencyContext.Provider>
	)
}
