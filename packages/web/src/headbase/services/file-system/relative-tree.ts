import {OPFSXDirectoryTree} from "opfsx";

export function relativeTree(tree: OPFSXDirectoryTree): OPFSXDirectoryTree {
	// Create a clone to not mutate the passed tree
	const newTree = structuredClone(tree)

	// Set given directory as root
	newTree.name = "/"
	newTree.path = "/"
	newTree.parentPath = "/"

	console.debug(tree)

	const relativePath = tree.path.slice(0, tree.path.length - 1)
	return _relativeTree(relativePath, newTree)
}

function _relativeTree(absoluteParent: string, tree: OPFSXDirectoryTree): OPFSXDirectoryTree {
	for (let index = 0; index < tree.children.length; index++) {
		const item = tree.children[index];
		if (item.kind === "file") {
			tree.children.splice(index, 1, {
				...item,
				path: item.path.replace(absoluteParent, ""),
				parentPath: item.parentPath.replace(absoluteParent, "") || "/"
			});
		}
		else {
			const relativeItem = _relativeTree(absoluteParent, item)
			tree.children.splice(index, 1, {
				...relativeItem,
				path: item.path.replace(absoluteParent, ""),
				parentPath: item.parentPath.replace(absoluteParent, "") || "/"
			});
		}
	}

	return tree
}
