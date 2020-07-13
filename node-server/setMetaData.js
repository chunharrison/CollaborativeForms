const fs = require('fs');
const { PDFDocument, PDFName } = require('pdf-lib');
  
const addMetadata = async (objectList) => {
    const pdfDoc = await PDFDocument.load(
        fs.readFileSync('abc.pdf'),
    );

    let keywords = pdfDoc.getKeywords().split(' ');
    pdfDoc.setKeywords(keyWords);

    return pdfBytes = await pdfDoc.save();
};

const checkMetadata = async () => {
    const pdfDoc = await PDFDocument.load(
        fs.readFileSync('out.pdf'),
    );

    console.log(pdfDoc.getKeywords().split(' '));

};

module.exports = { addMetadata, checkMetadata };