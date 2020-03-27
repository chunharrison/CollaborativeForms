import React, { Component } from 'react';


const url = './documents/sample.pdf'

let pdfDoc = null,
  pageNumInit = 1,
  numPages = 1,
  pageIsRendering = false,
  pageNumIsPending = null;

const scale = 1.5;

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


class PDFViewer extends Component {



};

export default PDFViewer;