import {cp, rm} from "node:fs/promises"

const LIBRARY_SOURCE = "../desktop/lib"

async function build() {
	console.debug("[build] Running build")

	console.debug("[build] Removing old `dist` folder")
	await rm("./dist", { recursive: true, force: true })

	console.debug(`[build] Copying ${LIBRARY_SOURCE} to \`dist\``)
	await cp(LIBRARY_SOURCE, "./dist", {recursive: true})

	console.debug("[build] Finished build")
}
build()
