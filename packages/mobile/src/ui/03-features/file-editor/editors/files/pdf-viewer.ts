import {
	type FilePlugin,
	type FilePluginEditorProps,
	type FilePluginEditorMethods,
	PLUGIN_TYPES
} from "@headbase-app/libweb";

import * as pdfjs from "pdfjs-dist"
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker?worker&url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl


async function PDFViewer({document, apis, filePath, container}: FilePluginEditorProps): Promise<FilePluginEditorMethods> {
	const data = await apis.filesAPI.read(filePath)

	const pdfContainer = document.createElement("div");
	const pdfDocument = await pdfjs.getDocument(data).promise
	const pageCount = pdfDocument.numPages
	const pdfPages: pdfjs.PDFPageProxy[] = []

	for (let pageNumber = 1; pageNumber <= pageCount; pageNumber+=1) {
		const currentPage = await pdfDocument.getPage(pageNumber)
		pdfPages.push(currentPage)

		const canvas = document.createElement("canvas");
		canvas.style.marginBottom = "20px";
		const canvasContext = canvas.getContext("2d")!;

		const scale = 1
		const outputScale = window.devicePixelRatio || 1;
		const transform = outputScale !== 1
			? [outputScale, 0, 0, outputScale, 0, 0]
			: undefined;

		const viewport = currentPage.getViewport({ scale: scale, });
		canvas.width = Math.floor(viewport.width * outputScale);
		canvas.height = Math.floor(viewport.height * outputScale);
		canvas.style.width = Math.floor(viewport.width) + "px";
		canvas.style.height =  Math.floor(viewport.height) + "px";

		const renderContext = {
			canvas,
			canvasContext: canvasContext,
			transform: transform,
			viewport: viewport
		};
		currentPage.render(renderContext);

		pdfContainer.appendChild(canvas);
	}
	container.append(pdfContainer)

	async function close() {
		for (const page of pdfPages) {
			page.cleanup()
		}
		await pdfDocument.destroy()
		container.removeChild(pdfContainer);
	}

	return {
		close
	}
}

export const PDFViewerPlugin: FilePlugin = {
	type: PLUGIN_TYPES.FILE,
	id: "headbase--pdf-viewer",
	name: "PDF Viewer",
	description: "Provides support for viewing PDF files",
	fileExtensions: [".pdf"],
	editor: PDFViewer,
}
