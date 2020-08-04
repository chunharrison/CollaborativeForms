const { PDFDocument } = require('pdf-lib');

//add information about our objects into the metadata for later extraction i.e. when a file gets reuploaded to cosign
export function addMetadata(pdfDoc, objectList) {
    pdfDoc.setKeywords(objectList);
    
    return pdfDoc;
};

//get metadata from pdf files to check if we have our objects in there or not
export async function getMetadata(selectedFile) {
    // Blob -> ArrayBuffer
    const PDFArrayBuffer = await selectedFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(
        PDFArrayBuffer
    );
    if (typeof pdfDoc.getKeywords() === 'undefined') {
        return [];
    }

    return pdfDoc.getKeywords().split(' ');

};
