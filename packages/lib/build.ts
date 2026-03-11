import {cp, rm} from "node:fs/promises"

async function build() {
	console.debug("[build] Starting")

	console.debug("[build] Removing old `dist` folder")
	await rm("./dist", { recursive: true, force: true })

	console.debug("[build] Copying `../web/lib` to `dist`")
	await cp("../web/lib", "./dist", {recursive: true})

	console.debug("[build] Done")
}
build()
