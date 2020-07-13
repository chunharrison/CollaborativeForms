const fs = require('fs');
const {PDFDocument,
    PDFRawStream,
    decodePDFRawStream,
    arrayAsString,
    PDFRef,
    rgb,
    PDFObject,
    PDFPage,} = require('pdf-lib');

const tempRgx = new RegExp(
    `q\n\/GS-5559680473 gs[^]*Q`
);

const createRectRegx = (pdfName) => {
    return rectRgx = new RegExp(
        `q\n${pdfName} gs[^]*Q`
    );
}
 
const createDrawRegx = (pdfName) => {
    return rectRgx = new RegExp(
        `q\n${pdfName} gs[^]*Q`
    );
}

const createTextRegx = (pdfName) => {
    return rectRgx = new RegExp(
        `q\n${pdfName} gs[^]*Q`
    );
}

const tryToDecodeStream = (maybeStream) => {
    if (maybeStream instanceof PDFRawStream) {
        return arrayAsString(decodePDFRawStream(maybeStream).decode());
    }
    return undefined;
};
  
const removeWhiteBackground = (streamContents,size) => {
    let match = streamContents.match(tempRgx);
    console.log(streamContents);
    if (match) {
        const targetStart = match.index || 0;
        const targetEnd = targetStart + match[0].length;
        streamContents =
        streamContents.substring(0, targetStart) +
        streamContents.substring(targetEnd, streamContents.length);
    }
    console.log(streamContents);
    return streamContents;
};

const removePageBackground = (page) => {
    const { Contents } = page.node.normalizedEntries();
    if (!Contents) return;
    Contents.asArray().forEach((streamRef) => {
      if (streamRef instanceof PDFRef) {
        const stream = page.doc.context.lookup(streamRef);
        const contents = tryToDecodeStream(stream);
        if (contents) {
          const newContents = removeWhiteBackground(contents, page.getSize());
          const newStream = page.doc.context.flateStream(newContents);
          page.doc.context.assign(streamRef, newStream);
        }
      }
    });
};

async function removeFromPDF() {
    const pdfDoc = await PDFDocument.load(
        fs.readFileSync('abc.pdf'),
    );

    const page = pdfDoc.getPage(0);
    removePageBackground(page);

    const newDoc = await PDFDocument.create();
    const embeddedPage = await newDoc.embedPage(page);

    const newPage = newDoc.addPage([page.getWidth(), page.getHeight()]);
    newPage.drawRectangle({
    width: page.getWidth(),
    height: page.getHeight(),
    opacity: 0,
    });
    newPage.drawPage(embeddedPage);

    const pdfBytes = await newDoc.save();

    fs.writeFileSync('./out.pdf', pdfBytes);
}

module.exports = { removeFromPDF };