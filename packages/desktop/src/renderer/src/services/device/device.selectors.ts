import {Environment} from "@/contracts/environment";
import {useEffect, useState} from "react";
import {useDeviceService} from "@renderer/services/device/device.context";

// todo: remove null type if not loading?
export interface UseEnvironment {
	environment: Environment | null
	isEnvironmentLoading: boolean
}

export function useEnvironment(): UseEnvironment {
	const { deviceService } = useDeviceService()

	const [environment, setEnvironment] = useState<Environment | null>(null)
	const [isEnvironmentLoading, setIsEnvironmentLoading] = useState(true)

	useEffect(() => {
		async function load() {
			try {
				const loadedEnvironment = await deviceService.getEnvironment()
				setEnvironment(loadedEnvironment)
				setIsEnvironmentLoading(false)
			}
			catch (e) {
				// todo: how to handle error?
				console.error(e)
			}
		}
		load()
	}, [deviceService])

	return {
		environment, isEnvironmentLoading
	}
}
