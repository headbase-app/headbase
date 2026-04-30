import {cp, rm} from "node:fs/promises"
import { execSync } from "node:child_process"

async function build() {
	console.debug("[build] Running build")

	console.debug("[build] Removing old `dist` folder")
	await rm("./dist", { recursive: true, force: true })

	console.debug("[build] Copying `../web/lib` to `dist`")
	await cp("../web/lib", "./dist", {recursive: true})

	console.debug("[build] Running 'npm pack'")
	execSync("npm pack")

	console.debug("[build] Finished build")
}
build()
