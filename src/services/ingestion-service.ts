import { processPdfContent, processTextContent } from "./extraction-service";

const textProcessingService = (format: string, text?: string, name?: string) => {
    switch (format) {
        case 'text':
            return processTextContent(text!)
        case 'pdf':
            return processPdfContent(Buffer.from(text!), name ?? "")
    }
}

const pdfProcessingService = (text: string, name = "") => {
    return processPdfContent(Buffer.from(text), name);
}

export {
    textProcessingService,
    pdfProcessingService
}
