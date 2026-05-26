import {
	FileEditorMetadata, FileEditorPlugin,
} from "../../../../../02-apis/plugin/plugin.api";

import * as pdfjs from "pdfjs-dist"
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker?worker&url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

export class PDFViewer extends FileEditorPlugin {
	static meta: FileEditorMetadata = {
		id: "headbase--pdf-viewer",
		name: "PDF Viewer",
		description: "Provides support for viewing PDF files",
		supportedExtensions: [".pdf"],
	}

	pdfContainer!: HTMLDivElement
	pdfDocument!: pdfjs.PDFDocumentProxy
	pdfPages!: pdfjs.PDFPageProxy[]

	async load() {
		const data = await this.apis.filesAPI.read(this.filePath)

		this.pdfContainer = document.createElement("div");
		this.pdfDocument = await pdfjs.getDocument(data).promise
		const pageCount = this.pdfDocument.numPages
		this.pdfPages = []

		for (let pageNumber = 1; pageNumber <= pageCount; pageNumber+=1) {
			const currentPage = await this.pdfDocument.getPage(pageNumber)
			this.pdfPages.push(currentPage)

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

			this.pdfContainer.appendChild(canvas);
		}

		this.container.append(this.pdfContainer)
	}

	async unload() {
		for (const page of this.pdfPages) {
			page.cleanup()
		}

		await this.pdfDocument.destroy()

		this.container.removeChild(this.pdfContainer)
	}
}
