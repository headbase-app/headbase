// todo: remove null type if not loading?
import {Environment} from "@contracts/environment";
import {useDependency} from "@framework/dependency.context";
import {useEffect, useState} from "react";

export interface UseEnvironment {
	environment: Environment | null
	isEnvironmentLoading: boolean
}

export function useEnvironment(): UseEnvironment {
	const { deviceApi } = useDependency()

	const [environment, setEnvironment] = useState<Environment | null>(null)
	const [isEnvironmentLoading, setIsEnvironmentLoading] = useState(true)

	useEffect(() => {
		async function load() {
			try {
				const loadedEnvironment = await deviceApi.getEnvironment()
				setEnvironment(loadedEnvironment)
				setIsEnvironmentLoading(false)
			}
			catch (e) {
				// todo: how to handle error?
				console.error(e)
			}
		}
		load()
	}, [deviceApi])

	return {
		environment, isEnvironmentLoading
	}
}
