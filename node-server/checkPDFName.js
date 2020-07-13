const fs = require('fs');
const {PDFDocument,
    PDFDict,
    PDFName,
    decodePDFRawStream,
    arrayAsString } = require('pdf-lib');

async function getObjectNames(pdfDoc, numPages) {
    let nameList = [];

    for(let index = 0; index < numPages; index++) {
        const page = pdfDoc.getPage(index);
        const objects = page.node
        .Resources()
        .lookup(PDFName.of('ExtGState'), PDFDict);


        if (objects) {
            let keys = Array.from(objects.dict.entries());
            for (let i = 0; i < keys.length; i++) {
                nameList.push(keys[0][0].encodedName)
            }
        }
    }

    return nameList;
}

function getNewObjectNames(prevList, currentList) {
    let newObjectNames = [];

    currentList.forEach(name => {
        if (!prevList.includes(name)) {
            newObjectNames.push(name);
        }
    })

    return newObjectNames;
}

module.exports = { checkPDFName };