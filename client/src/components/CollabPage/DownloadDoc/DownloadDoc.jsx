import React, { useState } from 'react'

// Redux
import { connect } from 'react-redux';

// Components
import Button from 'react-bootstrap/Button';

// Libraries
import { PDFDocument } from 'pdf-lib';
import { fabric } from 'fabric';
import download from 'downloadjs';

import downloadImg from './download.png'

const DownloadDoc = (props) => {
    // downloads the document with all the signatures
    async function downloadProc(event) {
        event.preventDefault()

        // change dataURI to a Uint8Array
        function dataURItoUint8Array(dataURI) {
            // convert base64 to raw binary data held in a string
            var byteString = atob(dataURI.split(',')[1]);

            // write the bytes of the string to an ArrayBuffer
            var arrayBuffer = new ArrayBuffer(byteString.length);

            var UI8A = new Uint8Array(arrayBuffer);

            for (var i = 0; i < byteString.length; i++) {
                UI8A[i] = byteString.charCodeAt(i);
            }

            return UI8A
        }

        ////// ATERNATIVE TO THE FUNCTION ON THE TOP
        // var BASE64_MARKER = ';base64,';

        // function convertDataURIToBinary(dataURI) {
        //     var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
        //     var base64 = dataURI.substring(base64Index);
        //     var raw = window.atob(base64);
        //     var rawLength = raw.length;
        //     var array = new Uint8Array(new ArrayBuffer(rawLength));

        //     for(let i = 0; i < rawLength; i++) {
        //         array[i] = raw.charCodeAt(i);
        //     }
        //     return array;
        // }

        // Blob -> ArrayBuffer
        const PDFArrayBuffer = await props.currentDoc.arrayBuffer();
        // create 'pdf-lib' PDFDocument object
        const pdfDoc = await PDFDocument.load(PDFArrayBuffer)
        // get pages
        let pages = pdfDoc.getPages()
        // loop through all the pages
        for (let pageNum = 1; pageNum <= props.numPages; pageNum++) {
            // request the list of signatures that are on that page from the server
            props.userSocket.emit(
                'getCurrentPageSignatures', 
                pageNum, 
                function (currentPageSignaturesJSONList) {
                // Array of JSON -> Array of FabricJS Objects
                fabric.util.enlivenObjects(currentPageSignaturesJSONList, function (signatureObjects) {
                    // loop through the array and add all the signatures to the page
                    signatureObjects.forEach(async function (signatureObject) {
                        // get the dataURI of the signature image
                        const signatureDataURI = signatureObject.src
                        // dataURI -> Uint8Array
                        // ALTERNATIVE: const signatureUint8Array = convertDataURIToBinary(signatureDataURI)
                        const signatureUint8Array = dataURItoUint8Array(signatureDataURI)
                        // embed the Uint8Array to the 'pdf-lib' PDFDocument object
                        const pngImage = await pdfDoc.embedPng(signatureUint8Array)
                        // draw the image to the current page
                        // (0, 0) refers to the bottom left corner 
                        const currPage = pages[pageNum - 1]
                        currPage.drawImage(pngImage, {
                            x: (signatureObject.left / 1.5),
                            y: (841 - signatureObject.top - signatureObject.height) / 1.5,
                            width: signatureObject.width / 1.5,
                            height: (signatureObject.height / 1.5)
                        })
                    })
                })
            })
        }

        // its kind of cringe but I had to give it a wait time aha
        // before saving & downloading the pdf
        // I think this is because the drawIamge function above takes time to render
        // everything on the page but have no way to check when they do
        setTimeout(async () => {
            // save the 'pdf-lib' PDFDocument object
            const pdfBytes = await pdfDoc.save()
            const fileName = "signed_document.pdf";
            download(pdfBytes, fileName, "application/pdf");
        }, 2000)
    }

    return (
        <button className='tool' onClick={event => downloadProc(event)}>
            <img src={downloadImg}/>
        </button>
    )
}

const mapStateToProps = state => ({
    // room
    userSocket: state.room.userSocket,

    // doc
    currentDoc: state.doc.currentDoc,
    numPages: state.doc.numPages,
})

export default connect(mapStateToProps ,{
    
})(DownloadDoc);