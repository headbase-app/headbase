import {useEffect, useRef} from "react";
import {default as corePlugin} from "./core.tsx"
import {getThirdPartyPlugin} from "./third-party.tsx";

export function PluginTest() {
	const corePluginContainer = useRef<HTMLDivElement>(null)
	const thirdPartyPluginContainer = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!corePluginContainer?.current) return
		const corePluginInstance = new corePlugin.plugin(corePluginContainer.current)
		corePluginInstance.init()

		return () => {
			corePluginInstance.teardown()
		}
	}, [corePluginContainer])

	useEffect(() => {
		let thirdPartyPluginInstance
		let cleanupRan = false
		let container = thirdPartyPluginContainer.current
		let effectRunContainer: HTMLDivElement

		async function effect() {
			if (!thirdPartyPluginContainer?.current) return

			// Create unique container so hook can run setup/teardown on container without effecting future hook runs.
			container = document.createElement("div")

			const third = await getThirdPartyPlugin()
			const thirdPartyPlugin = new third.plugin(container)
			thirdPartyPlugin.init()

			// React may clean up before async plugin is loaded, for example in strict mode, so if cleanup has already ran then retroactively run plugin cleanup
			if (cleanupRan) {
				thirdPartyPlugin.teardown()
			}
			else {
				thirdPartyPluginContainer.current.appendChild(container)
			}
		}
		effect()

		return () => {
			cleanupRan = true
			thirdPartyPluginInstance?.teardown()
			thirdPartyPluginContainer.current?.removeChild(container)
		}
	}, [thirdPartyPluginContainer])

	return (
		<div>
			<h2>Plugin Tests</h2>
			<div ref={corePluginContainer} />
			<div ref={thirdPartyPluginContainer} />
		</div>
	)
}