import {FileEditorReadOnlyPlugin} from "@headbase-app/libweb";

import * as pdfjs from "pdfjs-dist"
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker?worker&url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

export class PDFViewer extends FileEditorReadOnlyPlugin {
	filePath!: string
	container!: HTMLElement
	pdfContainer!: HTMLDivElement
	pdfDocument!: any // todo: type?
	pdfPages: pdfjs.PDFPageProxy[] = []

	static isFileSupported(filePath: string) {
		return filePath.endsWith(".pdf")
	}

	async load(filePath: string, container: HTMLElement) {
		this.filePath = filePath
		this.container = container
		const data = await this.apis.filesAPI.read(filePath)

		this.pdfDocument = await pdfjs.getDocument(data).promise
		const pageCount = this.pdfDocument.numPages

		this.pdfContainer = document.createElement("div");
		container.append(this.pdfContainer)

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
	}

	async close() {
		for (const page of this.pdfPages) {
			page.cleanup()
		}
		await this.pdfDocument.destroy()
		this.container.removeChild(this.pdfContainer);
	}
}
