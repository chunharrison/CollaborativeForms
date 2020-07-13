const {PDFDocument,
    PDFRawStream,
    decodePDFRawStream,
    arrayAsString,
    PDFRef, } = require('pdf-lib');

//we insert pdf encoded name here to find in the pdf page and delete
const createRegx = (pdfName) => {
    return new RegExp(`q\n${pdfName} gs[^]+?Q`);
}

//pdf stream is information about everything that is on the page and is encoded in its own dumb language, we need to decode to be able to read it
const tryToDecodeStream = (maybeStream) => {
    if (maybeStream instanceof PDFRawStream) {
        return arrayAsString(decodePDFRawStream(maybeStream).decode());
    }
    return undefined;
};

//reading through the stream and checking if any of our objects are in it. if so, delete from stream
const removeObjects = (streamContents,objectNames) => {
    let removedCount = 0;
    for (let i = 0; i < objectNames.length; i++) {
        let match = streamContents.match(createRegx(objectNames[i]));
        if (match) {
            const targetStart = match.index || 0;
            const targetEnd = targetStart + match[0].length;
            streamContents =
            streamContents.substring(0, targetStart) +
            streamContents.substring(targetEnd, streamContents.length);
            removedCount ++;
        }
    }

    return [streamContents, removedCount];
};

//remove objects page by page
const removePageObjects = (page, objectNames) => {
    const { Contents } = page.node.normalizedEntries();
    if (!Contents) return 0;
    let objectsRemoved = 0;
    Contents.asArray().forEach((streamRef) => {
      if (streamRef instanceof PDFRef) {
        const stream = page.doc.context.lookup(streamRef);
        const contents = tryToDecodeStream(stream);
        if (contents) {
            const value = removeObjects(contents, objectNames);
            let newContents = value[0];
            let removedCount = value[1];
            const newStream = page.doc.context.flateStream(newContents);
            page.doc.context.assign(streamRef, newStream);
            objectsRemoved = objectsRemoved + removedCount;
        }
      }
    });
    return objectsRemoved;
};

//remove objects from pdf
async function removeFromPDF(selectedFile, objectNames) {
    // Blob -> ArrayBuffer
    const PDFArrayBuffer = await selectedFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(
        PDFArrayBuffer
    );

    let pageCount = 0;
    let objectCount = 0;
    let pages = pdfDoc.getPages();

    while(pageCount < pages.length && objectCount < objectNames.length) {
        objectCount = objectCount + removePageObjects(pages[pageCount], objectNames.slice(objectCount, objectNames.length));
        pageCount++;
    }

    const pdfBytes = await pdfDoc.save();

    // Convert the Uint8Array to a Blob and save it.
    let pdfBlob = new Blob([pdfBytes]);

    return pdfBlob;
}

module.exports = { removeFromPDF };