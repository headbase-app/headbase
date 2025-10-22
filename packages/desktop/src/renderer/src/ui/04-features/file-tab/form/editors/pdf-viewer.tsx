import {IPluginEditorProps, IPluginEditorReturn} from "@ui/04-features/file-tab/file-tab";

import * as pdfjs from "pdfjs-dist"
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker?worker&url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

export async function PDFViewerPlugin({ filePath, container, filesAPI, setTabName }: IPluginEditorProps): Promise<IPluginEditorReturn> {
	const file = await filesAPI.read(filePath)
	setTabName(file.fileName)

	const pdfDocument = await pdfjs.getDocument(file.buffer).promise
	const pageCount = pdfDocument.numPages

	const pdfContainer = document.createElement("div");
	container.append(pdfContainer)

	const pages: pdfjs.PDFPageProxy[] = []
	for (let pageNumber = 1; pageNumber <= pageCount; pageNumber+=1) {
		const currentPage = await pdfDocument.getPage(pageNumber)
		pages.push(currentPage)

		const canvas = document.createElement("canvas");
		canvas.style.marginBottom = "20px";
		const canvasContext = canvas.getContext("2d")!;

		const scale = 1
		const outputScale = window.devicePixelRatio || 1;
		const transform = outputScale !== 1
			? [outputScale, 0, 0, outputScale, 0, 0]
			: null;
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

	async function save() {}

	async function unmount() {
		for (const page of pages) {
			page.cleanup()
		}
		await pdfDocument.destroy()
		container.removeChild(pdfContainer);
	}

	return {save, unmount}
}
