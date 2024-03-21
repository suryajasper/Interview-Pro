import { PDFDocumentProxy, getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

async function parseResume(pdfFile: File): Promise<string> {
    const pdfBuffer = await fileToArrayBuffer(pdfFile);
    const pdf = await getDocument({ data: pdfBuffer }).promise;

    let resumeText = '';

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();

        textContent.items.forEach((textItem) => {
            textItem = textItem as TextItem;
            resumeText += textItem.str + ' ';
        });
    }

    return resumeText;
}

async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert file to ArrayBuffer.'));
            }
        };
        reader.onerror = () => {
            reject(new Error('Error reading file.'));
        };
        reader.readAsArrayBuffer(file);
    });
}

export default parseResume;