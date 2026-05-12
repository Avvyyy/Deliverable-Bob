const processTextContent = async (text: string) => {
    if (!text) return "";

    text
        // Remove HTML tags
        .replace(/<[^>]*>/g, " ")

        // Decode basic HTML entities
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")

        // Normalize whitespace
        .replace(/\s+/g, " ")
        .trim();

    if (!text) throw new Error("Text is empty!")

    return text;

}

const processPdfContent = async (buffer: Buffer, name: string) => {

}

export { processTextContent, processPdfContent }