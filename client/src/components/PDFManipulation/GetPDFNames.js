const { PDFName } = require('pdf-lib');

//get list of objects called PDFName from pdf --> this is used as identification for each object
export function getObjectNames(pdfDoc, numPages) {
    let nameList = [];

    //page.node is a container for all everything on the page, extgstate is a group of objects on the pdf that shapes reside under
    for(let index = 0; index < numPages; index++) {
        const page = pdfDoc.getPage(index);
        const objects = page.node
        .Resources()
        .lookup(PDFName.of('ExtGState'));

        if (objects) {
            let keys = Array.from(objects.dict.entries());
            for (let i = 0; i < keys.length; i++) {
                nameList.push(keys[i][0].encodedName)
            }
        }
    }

    return nameList;
}

//we look at the pdfname objects on the page before and after objects are added to it. this is how we differentiate our objects from previously added ones 
//this way when we upload the file we know what to remove and add as fabric objects
export function getNewObjectNames(prevList, currentList) {
    let newObjectNames = [];
    currentList.forEach(name => {
        if (!prevList.includes(name)) {
            newObjectNames.push(name);
        }
    })

    return newObjectNames;
}