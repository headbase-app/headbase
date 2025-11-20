import {type OPFSXDirectoryTree} from "opfsx";
import type {FileSystemDirectory} from "@api/files/files.interface.ts";

export function processTree(tree: OPFSXDirectoryTree): FileSystemDirectory {
	// Create a clone to not mutate the passed tree
	const sourceTree = structuredClone(tree)
	const outputTree = _processTree(tree.path, sourceTree)

	// Override top level directory to display as root relative to the tree.
	return {
		type: "directory",
		name: "/",
		path: "/",
		parentPath: "",
		_platformPath: tree.path,
		children: outputTree.children
	}
}

function _processTree(commonParentPath: string, tree: OPFSXDirectoryTree): FileSystemDirectory {
	const directory: FileSystemDirectory = {
		type: "directory",
		name: tree.name,
		path: tree.path.replace(commonParentPath, ""),
		parentPath: tree.parentPath.replace(commonParentPath, "") || "/",
		_platformPath: tree.path,
		children: []
	}

	for (const child of tree.children) {
		if (child.kind === "directory") {
			const childTree = _processTree(commonParentPath, child)
			directory.children.push(childTree)
		}
		else {
			directory.children.push({
				type: "file",
				name: child.name,
				path: child.path.replace(commonParentPath, ""),
				parentPath: child.parentPath.replace(commonParentPath, "") || "/",
				_platformPath: child.path,
			})
		}
	}

	return directory
}
