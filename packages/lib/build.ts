import {cp, rm} from "node:fs/promises"

async function build() {
	console.debug("[build] Running build")

	console.debug("[build] Removing old `dist` folder")
	await rm("./dist", { recursive: true, force: true })

	const librarySrc = "../desktop/lib"
	console.debug(`[build] Copying ${librarySrc} to \`dist\``)
	await cp(librarySrc, "./dist", {recursive: true})

	console.debug("[build] Finished build")
}
build()
