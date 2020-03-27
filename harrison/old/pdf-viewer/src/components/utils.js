// app.js
// leverages the PDF.js API to render the first page

const url = './documents/sample.pdf'

let pdfDoc = null,
  pageNumInit = 1,
  numPages = 1,
  pageIsRendering = false,
  pageNumIsPending = null;

const scale = 1.5;

export function renderPage(pageNum) {
  pageIsRendering = true;
  
  // Wrapper div tag
  var newCanvas = document.createElement('canvas');
  var canvasId = pageNum - 1;
  var canvasClassName = 'pdf-page-canvas';
  newCanvas.id = canvasId;
  newCanvas.className = canvasClassName;

  // Page canvas tag
  var newCanvasWrapper = document.createElement('div');
  var divId = 'pdf-page-canvas-wrapper';
  newCanvasWrapper.id = divId;
  newCanvasWrapper.appendChild(newCanvas);

  // Page Canvas tag
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

    page.render(renderContext).promise.then(() => {
      pageIsRendering = false;
    });
  });
};

var loadingTask = pdfjsLib.getDocument(url);
loadingTask.promise.then(pdfDoc_ => {

    console.log('PDF Loaded');

    // Fetch the first page
    var pageNumber = 1;
    pdf.getPage(pageNumber).then(function(page) {
        console.log('Page loaded');
        
        var scale = 1.5;
        var viewport = page.getViewport({scale: scale});

        // Prepare canvas using PDF page dimensions
        var canvas = document.getElementById('the-canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        var renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
            console.log('Page rendered');
        });
    });
}, function (reason) {
    // PDF loading error
    console.error(reason);
});