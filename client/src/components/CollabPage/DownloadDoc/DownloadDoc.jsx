    import React, { useState } from 'react'

    // Redux
    import { connect } from 'react-redux';

    // Components
    import { getObjectNames, getNewObjectNames } from '../../PDFManipulation/GetPDFNames';
    import { addMetadata } from '../../PDFManipulation/PDFMetadata';


    // Libraries
    import { PDFDocument, rgb } from 'pdf-lib';
    import { fabric } from 'fabric';
    import download from 'downloadjs';

    import downloadImg from './download.png'

    import './DownloadDoc.css'

    const DownloadDoc = (props) => {
        //ORDER: 
        //rect: 'rect',page,x,y,width,height,color,opacity,bordercolor,borderwidth,borderopacity
        //path: 'path',page,x,y,width,height,bordercolor,borderwidth,borderopacity,path
        //text: 'text',page,x,y,size,color,opacity
        const propertyList = []
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

            //convert fabric objects only present on the canvas in to actual pdf objects embedded
            async function insertObject(currPage, object, type, pageNum) {
                let pageHeight = currPage.getHeight();
                if (type === 'image') {
                    // get the dataURI of the signature image
                    const signatureDataURI = object.src
                    // dataURI -> Uint8Array
                    // ALTERNATIVE: const signatureUint8Array = convertDataURIToBinary(signatureDataURI)
                    const signatureUint8Array = dataURItoUint8Array(signatureDataURI)
                    // embed the Uint8Array to the 'pdf-lib' PDFDocument object
                    const pngImage = await pdfDoc.embedPng(signatureUint8Array)
                    // draw the image to the current page
                    // (0, 0) refers to the bottom left corner 
                    currPage.drawImage(pngImage, {
                        x: (object.left),
                        y: (841 - object.top - object.height),
                        width: object.width,
                        height: (object.height)
                    })
                } else if ( type === 'rect') {
                    //embed rectangle
                    let matchFill = object.fill.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
                    let matchStroke = object.stroke.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
                    currPage.drawRectangle({
                        x: object.left,
                        y: pageHeight - object.top - object.height,
                        width: object.width,
                        height:object.height,
                        borderColor: rgb(parseInt(matchStroke[1]) / 256, parseInt(matchStroke[2]) / 256, parseInt(matchStroke[3]) / 256),
                        borderOpacity: object.opacity,
                        color: rgb(parseInt(matchFill[1]) / 256, parseInt(matchFill[2]) / 256, parseInt(matchFill[3]) / 256),
                        opacity: object.opacity,
                        borderWidth: object.strokeWidth,
                    })
                    propertyList.push(`,rect,${pageNum},${object.left},${object.top},${object.width},${object.height},${matchFill[1]}.${matchFill[2]}.${matchFill[3]},` + 
                    `${object.opacity},${matchStroke[1]}.${matchStroke[2]}.${matchStroke[3]},${object.strokeWidth},${object.opacity}`)
                } else if (type === 'path') {
                    //embed path
                    let matchStroke = object.stroke.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
                    currPage.drawSvgPath(object.path.join(' ').replace(/([A-Za-z ])\,/g, '$1 '), {
                        x: 0 + (object.left - object.get('originalX').originalX),
                        y: pageHeight - (object.top - object.get('originalY').originalY),
                        borderLineCap: 1,
                        borderWidth: object.strokeWidth,
                        borderColor: rgb(parseInt(matchStroke[1]) / 256, parseInt(matchStroke[2]) / 256, parseInt(matchStroke[3]) / 256),
                        borderOpacity: (typeof matchStroke[4] !== 'undefined' ? parseFloat(matchStroke[4]) : 1),
                    })  
                    propertyList.push(`,path,${pageNum},${object.left},${object.top},${object.width},${object.height},${matchStroke[1]}.${matchStroke[2]}.${matchStroke[3]},${object.strokeWidth},` + 
                        `${object.opacity},!${object.path}`) 
                } else if (type === 'i-text') {
                    //embed text
                    let matchStroke = object.fill.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
                    currPage.drawText(object.text, {
                        x: object.left,
                        y: pageHeight - object.top - object.height,
                        size: parseInt(object.fontSize),
                        color: rgb(parseInt(matchStroke[1]) / 256, parseInt(matchStroke[2]) / 256, parseInt(matchStroke[3]) / 256),
                        opacity: object.opacity,
                    })
                    propertyList.push(`,text,${pageNum},${object.left},${object.top},${object.fontSize},${matchStroke[1]}.${matchStroke[2]}.${matchStroke[3]},${object.opacity}`)
                }
            }

            // Blob -> ArrayBuffer
            const PDFArrayBuffer = await props.currentDoc.arrayBuffer();
            // create 'pdf-lib' PDFDocument object
            let pdfDoc = await PDFDocument.load(PDFArrayBuffer)
            let oldObjectNames = getObjectNames(pdfDoc, props.numPages);
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
                    fabric.util.enlivenObjects(currentPageSignaturesJSONList, function (objects) {
                        // loop through the array and add all the signatures to the page
                        objects.forEach(async function (object) {
                            insertObject(pages[pageNum - 1], object, object.get('type'), pageNum);
                        })
                    })

                })

                // if (props.demoPageDownload) {
                //     pages[pageNum - 1].begin_template_ext(0, 0, "watermark={location=ontop opacity=60%}");
                //     pages[pageNum - 1].fit_textline("Cosign", 0, 0, "fontsize=12 fontname=Helvetica-Bold encoding=unicode fillcolor=red " + "boxsize={595 842} stamp=ll2ur");
                //     pages[pageNum - 1].end_template_ext(0, 0);
                // }
            }

            // its kind of cringe but I had to give it a wait time aha
            // before saving & downloading the pdf
            // I think this is because the drawIamge function above takes time to render
            // everything on the page but have no way to check when they do
            setTimeout(async () => {
                // save the 'pdf-lib' PDFDocument object
                let newObjectNames = getObjectNames(pdfDoc, props.numPages);
                newObjectNames = getNewObjectNames(oldObjectNames, newObjectNames);

                for (let i = 0; i < newObjectNames.length; i++) {
                    newObjectNames[i] = newObjectNames[i] + propertyList[i]; 
                }

                pdfDoc = addMetadata(pdfDoc, newObjectNames);
                console.log(pdfDoc.getKeywords().split(' '));
                const pdfBytes = await pdfDoc.save();
                const fileName = "signed_document.pdf";
                download(pdfBytes, fileName, "application/pdf");
            }, 2000)
        }

        return (
            <div>
            {
                !props.demoPageDownload 
                ? 
                <div class="dropdown">
                    <button className='tool'>
                        <img src={downloadImg}/>
                    </button>
                    {/* <div class="dropdown-content">
                        <a href="#" onClick={event => downloadProc(event)}>Signed</a>
                        <a href="#">Original</a>
                    </div> */}
                </div>
                :
                <button className='tool' onClick={event => downloadProc(event)}>
                    <img src={downloadImg}/>
                </button>
            }
            </div>
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