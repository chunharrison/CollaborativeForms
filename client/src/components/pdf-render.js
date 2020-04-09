const pdfjsLib = require('pdfjs-dist')

export function PDFRender(){
    const url = './documents/sample.pdf'

    let pdfDoc = null,
        numPages = 1

    const scale = 1.5;

    const renderPage = pageNum => {

        var newCanvas = document.createElement('canvas');
        var canvasId = pageNum - 1;
        var canvasClassName = 'pdf-page-canvas';
        newCanvas.id = canvasId;
        newCanvas.className = canvasClassName;

        var newCanvasWrapper = document.createElement('div');
        var divId = 'pdf-page-canvas-wrapper';
        newCanvasWrapper.id = divId;
        newCanvasWrapper.appendChild(newCanvas);

        var outerDiv = document.getElementById('pdf-viewer');
        outerDiv.appendChild(newCanvasWrapper);

        // var canvas = document.getElementById(canvasId);
        var context = newCanvas.getContext('2d');

        // Get Page of the PDF document
        pdfDoc.getPage(pageNum).then(page => {
            // Set scale of the pages
            const viewport = page.getViewport({ scale });
            newCanvas.height = viewport.height;
            newCanvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            page.render(renderContext)
        });
    };

    pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
        pdfDoc = pdfDoc_;
        console.log(pdfDoc);
        numPages = pdfDoc.numPages;
        for (var currPageNum = 1; currPageNum <= numPages; currPageNum++) {
            renderPage(currPageNum);
        };
    });
}