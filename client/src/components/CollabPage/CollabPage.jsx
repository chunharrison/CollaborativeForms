import React from 'react';

// Components
import LoadPage from '../LoadPage/LoadPage';
import { Document, Page } from 'react-pdf'; // open source
import Signature from '../Signature/Signature';
import { Redirect } from 'react-router-dom'; // open source
import CopyRoomCode from '../CopyRoomCode/CopyRoomCode';
// react-bootstrap
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';

// Libraries
import { fabric } from 'fabric';
import { nanoid } from 'nanoid';
import io from "socket.io-client";
import queryString from 'query-string';
import axios from 'axios';
import jsPDF from 'jspdf'; // for downloading the document
import {degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import download from 'downloadjs'

// PDF document (for dev)
import PDF from '../docs/sample.pdf';

//CSS
import './CollabPage.css';

class CollabPageNew extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            givenPDFDocument: null,

            // Document info
            numPages: 0, // number of pages the document have
            width: 0, // width of the document pages after being scaled up/down
            originalWidth: 0, // orignal width of the document pages
            height: 0, // height of the document pages after being scaled up/down
            originalHeight: 0, // orignal height of the document pages

            // Render
            firstPageRendered: false,
            dataURLFormat: 'image/png', // the argument we pass into all toDataURL functions

            // Signature
            signatureURL: null,
            pageX: 0,
            pageY: 0,
            holding: false,

            // Zoom (To Be Implemented)
            currentZoom: 1,
            
            // Server
            endpoint: 'http://localhost:5000',
            // socket: null,
            socket: true,
            disconnected: false,
            invalidRoomCodeGiven: false,
            currentUsers: []
        }

        // Render
        this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
        this.renderFabricCanvas = this.renderFabricCanvas.bind(this);
        this.onPageLoadSuccess = this.onPageLoadSuccess.bind(this);
        
        // Download 
        this.downloadProc = this.downloadProc.bind(this);
        
        // Browser Functionality
        this.scrollToPage = this.scrollToPage.bind(this);

        // Signature
        this.mouseMove = this.mouseMove.bind(this);
        this.setSignatureURL = this.setSignatureURL.bind(this);
        this.addImage = this.addImage.bind(this);
        this.delObject = this.delObject.bind(this);

        // Backend
        this.setSocket = this.setSocket.bind(this);
        this.invalidRoomCodeProc = this.invalidRoomCodeProc.bind(this)

        // Component Variables
        this.inViewElements = null; 
        this.currentCanvas = null;
        this.fabricCanvases = [];
    }
    
    
    /* #################################################################################################
    ############################################ Document ##############################################
    ################################################################################################# */

    // procs when the document is successfully loaded by the Document component from react-pdf
    // retrieves the number of pdf pages and store it in state
    onDocumentLoadSuccess = (pdf) => {
        this.setState({
            numPages: pdf.numPages
        }) 
    }

    renderFabricCanvas = (dataURLFormat, pageNum, width, height, socket, roomCode) => {
        let self = this

        // get the canvas element created by react-pdf
        const pageCanvasWrapperElement = document.getElementsByClassName(`react-pdf__Page ${pageNum}`)[0]
        const pageCanvasElement = pageCanvasWrapperElement.firstElementChild
        pageCanvasElement.id = pageNum.toString()
        const backgroundImg = pageCanvasElement.toDataURL(dataURLFormat) // maybe turn this into JSON
        let browserElement = document.getElementById(`browser-${pageNum}`);
        browserElement.style.backgroundImage = `url(${backgroundImg})`;
        // create fabric canvas element with correct dimensions of the document
        let fabricCanvas = new fabric.Canvas(pageNum.toString(), {width: width, height: height})
        document.getElementById(pageNum.toString()).fabric = fabricCanvas;
        // set the background image as what is on the document
        fabric.Image.fromURL(backgroundImg, function(img) {
            // // set correct dimensions of the image
            // img.scaleToWidth(self.state.width)
            // img.scaleToHeight(self.state.height)
            // set the image as background and then render
            fabricCanvas.setBackgroundImage(img);
            fabricCanvas.requestRenderAll();            
        })

        // if you are joinging and existing room and there are signatures that were already placed
        socket.emit('getCurrentPageSignatures', pageNum, (currentPageSignaturesJSONList) => {
            // Array of JSON -> Array of FabricJS Objects
            fabric.util.enlivenObjects(currentPageSignaturesJSONList, function(signatureObjects) {
                // loop through the array
                signatureObjects.forEach(function(signatureObject) {
                    // add the signature to the page
                    document.getElementById(pageNum.toString()).fabric.add(signatureObject)
                })
            })
        })

        fabricCanvas.on('mouse:up', function(e) {
            if (e.e.target.previousElementSibling !== null) {
                // let currentCanvas = self.state.canvas[parseInt(e.e.target.previousElementSibling.id)]
                if (self.state.holding){
                    self.addImage(fabricCanvas, self.state.signatureURL, e.pointer.x, e.pointer.y);
                    self.setState({
                        holding: false,
                        toSend: true
                    });
                }
            }
        });

        fabricCanvas.on('object:added', function(e) {
            const newSignatureObject = e.target
            const newSignatureObjectJSON = JSON.parse(JSON.stringify(newSignatureObject.toObject(['id'])))
            
            let pageData = {
                pageNum: pageNum,
                newSignatureObjectJSON: newSignatureObjectJSON
            }

            if (self.state.toSend) {
                socket.emit('addIn', pageData)
                self.setState({ toSend:false });
            }
        });

        fabricCanvas.on('object:modified', function(e) {
            const modifiedSignatureObject = e.target
            const modifiedSignatureObjectJSON = JSON.parse(JSON.stringify(modifiedSignatureObject.toObject(['id'])))

            let pageData = {
                pageNum: pageNum,
                modifiedSignatureObjectJSON: modifiedSignatureObjectJSON
            }

            socket.emit('editIn', pageData)
        });

        fabricCanvas.on('object:moving', function (e) {
            var obj = e.target;
        
            // if object is too big ignore
            if(obj.getScaledHeight() > obj.canvas.height || obj.getScaledWidth() > obj.canvas.width){
                return;
            }        
            obj.setCoords();        
            // top-left  corner
            if(obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0){
                obj.top = Math.max(obj.top, obj.top-obj.getBoundingRect().top);
                obj.left = Math.max(obj.left, obj.left-obj.getBoundingRect().left);
            }
            // bot-right corner
            if(obj.getBoundingRect().top+obj.getBoundingRect().height  > obj.canvas.height || obj.getBoundingRect().left+obj.getBoundingRect().width  > obj.canvas.width){
                obj.top = Math.min(obj.top, obj.canvas.height-obj.getBoundingRect().height+obj.top-obj.getBoundingRect().top);
                obj.left = Math.min(obj.left, obj.canvas.width-obj.getBoundingRect().width+obj.left-obj.getBoundingRect().left);
        }});

        fabricCanvas.on('object:removed', function(e) {
            const removedSignatureObject = e.target
            const removedSignatureObjectJSON = JSON.parse(JSON.stringify(removedSignatureObject.toObject(['id'])))

            let pageData = {
                pageNum: pageNum,
                removedSignatureObjectJSON: removedSignatureObjectJSON
            }

            if (self.state.toSend) {
                socket.emit("deleteIn", pageData)
                self.setState({ toSend: false });
            }
            
        });

        fabricCanvas.on('selection:created', function(e) {
            for (let i = 1; i <= self.state.numPages; i++) {
                if (i === pageNum) {
                    continue;
                }
                let canvasObject = document.getElementById(i.toString())
                if (canvasObject) {
                    let fabricCanvasObject = canvasObject.fabric
                    fabricCanvasObject.discardActiveObject().renderAll();
                }
            }
        });
    }

    // procs when the first page is successfully loaded by the Page component from react-pdf
    // retrieves the (scaled and orignal) width, height and store them in state
    onPageLoadSuccess = (page) => {
        this.setState({
            width: page.width,
            originalWidth: page.originalWidth,
            height: page.height,
            originalHeight: page.originalHeight
        })
    }

    // generates InView elements (with wrapper) for each pages for the document after the first page loads
    // this is so that the pages do not render all at once only when the page is in view of the browser window
    createInViewElements = () => {
        const { roomCode, socket, numPages, width, height, dataURLFormat } = this.state;
        let InViewElementList = [];

        for (let pageNum = 2; pageNum <= numPages; pageNum++) {

            InViewElementList.push(
                <LoadPage
                    socket={socket}
                    pageNum={pageNum}
                    width={width}
                    height={height}
                    dataURLFormat={dataURLFormat}
                    roomCode={roomCode}
                    renderFabricCanvas={this.renderFabricCanvas}
                />
            )
        }

        return InViewElementList;
    }

    // downloads the document with all the signatures
    async downloadProc(event) {
        event.preventDefault()
        const { givenPDFDocument, numPages, socket, height } = this.state;

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
        const PDFArrayBuffer = await givenPDFDocument.arrayBuffer();
        // create 'pdf-lib' PDFDocument object
        const pdfDoc = await PDFDocument.load(PDFArrayBuffer)
        // get pages
        let pages = pdfDoc.getPages()
        // loop through all the pages
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            // request the list of signatures that are on that page from the server
            socket.emit('getCurrentPageSignatures', pageNum, function(currentPageSignaturesJSONList) {
                // Array of JSON -> Array of FabricJS Objects
                fabric.util.enlivenObjects(currentPageSignaturesJSONList, function(signatureObjects) {
                    // loop through the array and add all the signatures to the page
                    signatureObjects.forEach(async function(signatureObject) {
                        // get the dataURI of the signature image
                        const signatureDataURI = signatureObject.src
                        // dataURI -> Uint8Array
                        // ALTERNATIVE: const signatureUint8Array = convertDataURIToBinary(signatureDataURI)
                        const signatureUint8Array = dataURItoUint8Array(signatureDataURI)
                        // embed the Uint8Array to the 'pdf-lib' PDFDocument object
                        const pngImage = await pdfDoc.embedPng(signatureUint8Array)
                        // draw the image to the current page
                        // (0, 0) refers to the bottom left corner 
                        const currPage = pages[pageNum-1]
                        currPage.drawImage(pngImage, {
                            x: (signatureObject.left / 1.5),
                            y: (height - signatureObject.top - signatureObject.height) / 1.5,
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

    /* #################################################################################################
    ################################################################################################# */





    /* #################################################################################################
    ############################################ Signature #############################################
    ################################################################################################# */

    mouseMove(e) {
        if(this.state.holding) {
            let image = document.getElementById('signature-placeholder')
            image.style.top = e.pageY + 'px';
            image.style.left = e.pageX + 'px';
        }
    }  

    // parent function for the signature component
    // sets the image url to the current singaure being held by the cursor
    setSignatureURL(signatureURL, e){
        if (signatureURL !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=') {
            this.setState({
                signatureURL: signatureURL,
                holding: true,
                pageX: e.pageX,
                pageY: e.pageY
            });
        }
    }

    // adding the signature onto the canvas
    addImage(currentCanvas, url, x, y){
        let self = this;

        // create FabricJS Image object to place on the FabricJS Canvas object 
        fabric.Image.fromURL(url, function(signature) {
            // set a unique id, and corresponding padding for the signature object
            var img = signature.set({ 
                id: nanoid(),   // id
                left: (x - signature.width / 2) / self.state.currentZoom,   // left padding
                top: (y - signature.height / 2) / self.state.currentZoom    // top padding
            });
            currentCanvas.add(img);
        });

        // released
        this.setState({holding: false});
    }
    
    // deletes the signatures on the canvas that are selected
    delObject(event) {
        if(event.keyCode === 46) {
            this.setState({holding: false});
            for (let pageNum = 0; pageNum < this.state.numPages; pageNum++) {
                let currentPageCanvas = document.getElementById(pageNum.toString());
                if (typeof currentPageCanvas === 'object' && currentPageCanvas !== null) {
                    let currentPageFabricCanvas = currentPageCanvas.fabric;
                    var activeObject = currentPageFabricCanvas.getActiveObjects()
                    if (activeObject.length > 0) {
                        this.setState({toSend: true}, () => {
                            currentPageFabricCanvas.discardActiveObject();
                            currentPageFabricCanvas.remove(...activeObject);
                        });
                    } 
                }
            }
        }     
    }

    scrollToPage(e) {
        let element = document.getElementById(`container-${e.target.id.split('-')[1]}`);
        element.scrollIntoView();
    }

    /* #################################################################################################
    ################################################################################################# */





    /* #################################################################################################
    ############################################# Backend ##############################################
    ################################################################################################# */

    receiveAdd(pageData) {
        const { pageNum, newSignatureObjectJSON } = pageData
        if (document.getElementById(pageNum.toString()) !== null) {
            fabric.util.enlivenObjects([newSignatureObjectJSON], function(newSignatureObject) {
                let fabricCanvasObject = document.getElementById(pageNum.toString()).fabric
                fabricCanvasObject.add(newSignatureObject[0])
            })
        }
    }

    receiveEdit(pageData) {
        const {pageNum, modifiedSignatureObjectJSON} = pageData
        if (document.getElementById(pageNum.toString()) !== null) {
            fabric.util.enlivenObjects([modifiedSignatureObjectJSON], function(modifiedSignatureObject) {
                let fabricCanvasObject = document.getElementById(pageNum.toString()).fabric
    
                let origRenderOnAddRemove = fabricCanvasObject.renderOnAddRemove;
                fabricCanvasObject.renderOnAddRemove = false;
    
                fabricCanvasObject.getObjects().forEach(function(currentSignatureObject) {
                    if (modifiedSignatureObject[0].id === currentSignatureObject.id) {
                        fabricCanvasObject.remove(currentSignatureObject);
                        fabricCanvasObject.add(modifiedSignatureObject[0]);
                    }
                })
    
                fabricCanvasObject.renderOnAddRemove = origRenderOnAddRemove;
                fabricCanvasObject.renderAll();
            })
        }
    }

    receiveDelete(pageData) {
        const {pageNum, removedSignatureObjectJSON} = pageData
        if (document.getElementById(pageNum.toString()) !== null) {
            fabric.util.enlivenObjects([removedSignatureObjectJSON], function(removedSignatureObjects) {
                // get the signature object
                let removedSignatureObject = removedSignatureObjects[0]
                // fabric canvas object of the pageNum
                let fabricCanvasObject = document.getElementById(pageNum.toString()).fabric
                fabricCanvasObject.getObjects().forEach(function(currentSignatureObject) {
                    if (removedSignatureObject.id === currentSignatureObject.id) {
                        fabricCanvasObject.remove(currentSignatureObject);
                    }
                })
                fabricCanvasObject.discardActiveObject().renderAll();
            })
        }
    }

    invalidRoomCodeProc() {
        this.setState({
            invalidRoomCodeGiven: true
        })
    }

    setSocket(username, roomCode, action) {
        // Socket.io
        const socket = io(this.state.endpoint); 

        // when a user joins, send the server the username to be stored 
        // and the roomcode to update the correct database
        // the server then emits an initial setup with:
        //      the document file, existing signature object and the list of people in the room
        socket.on('join', () => {

            // request PDF
            const generateGetUrl = 'http://localhost:5000/generate-get-url';
            const options = {
                params: {
                    Key: `${roomCode}.pdf`,
                    ContentType: 'application/pdf'
                },
                headers: {
                'Access-Control-Allow-Credentials' : true,
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Methods':'GET',
                'Access-Control-Allow-Headers':'application/pdf',
                },
            };
            axios.get(generateGetUrl, options).then(res => {
                const { data: getURL } = res;
                this.setState({ getURL });
                //get the data with the url that was given, then turn the data into a blob, which is the representation of a file without a name. this can be fed to a pdf render
                fetch(getURL)
                    .then(response => response.blob()).then((blob) => {
                this.setState({givenPDFDocument:blob})
                })
            });

            const creation = action === 'create' ? true : false;
            socket.emit('join', { username, roomCode, creation })
        });

        // Connection
        socket.on('disconnect', () => {
            this.setState({disconnected: true});
        })
        socket.on('reconnect', () => {
            window.location.reload();
            this.setState({disconnected: false});
        })
        socket.on('updateCurrentUsers', (currentUsers) => {
            this.setState({
                currentUsers: currentUsers
            })  
        })
        socket.on("invalidRoomCode", () => this.invalidRoomCodeProc())
        // we will need for alerts in the futre
        // socket.on('userJoined', (currentUsers, username) => {
        //     this.setState({currentUsers: currentUsers})
        //     console.log(currentUsers)
        // })
        // socket.on('userDisconnected', (currentUsers, username) => {
        //     this.setState({currentUsers: currentUsers})
        //     console.log(currentUsers)
        // })


        // Signatures
        socket.on("addOut", (pageData) => this.receiveAdd(pageData))
        socket.on("editOut", (pageData) => this.receiveEdit(pageData))
        socket.on("deleteOut", (pageData) => this.receiveDelete(pageData))

        // set socket.io to state
        this.setState({socket:socket})
    }

    /* #################################################################################################
    ################################################################################################# */





    /* #################################################################################################
    ##################################### The Component Lifecycle ######################################
    ################################################################################################# */

    componentDidMount() {
        document.addEventListener("keydown", this.delObject, false);

        // parse the query parameters and set states accordingly
        // query: ?username=username&roomCode=roomCode
        // THEN setup Socket.io object
        const username = '' + queryString.parse(this.props.location.search).username
        const roomCode = '' + queryString.parse(this.props.location.search).roomCode
        const action = '' + queryString.parse(this.props.location.search).action
        this.setState({username, roomCode, action}, () => { 
            this.setSocket(username, roomCode, action); // Socket.io
        })
    }

    componentDidUpdate(prevProps, prevState) {

        // after we extract the correct number of pages, width and height, 
        // generate inview elements for rest of the pages
        if (0 !== this.state.numPages && 
            0 !== this.state.width && 
            0 !== this.state.height && 
            this.inViewElements === null) {
            this.inViewElements = this.createInViewElements();
        }

        // after the first page is fully rendered, convert it into a fabricJS canvas element
        if (prevState.firstPageRendered !== this.state.firstPageRendered && this.state.firstPageRendered) {
            this.renderFabricCanvas(
                this.state.dataURLFormat,
                1,                          // pageNum
                this.state.width, 
                this.state.height,
                this.state.socket,
                this.state.roomCode
            )
        }

        if (prevState.holding === false && this.state.holding === true) {
            let image = document.getElementById('signature-placeholder')
            image.style.top = this.state.pageY + 'px';
            image.style.left = this.state.pageX + 'px';
        }

    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.delObject, false);
    }

    
    /* #################################################################################################
    ################################################################################################# */

    render() {
        // State Variables 
        const { givenPDFDocument, roomCode, socket, signatureURL, holding, invalidRoomCodeGiven } = this.state;

        if (invalidRoomCodeGiven) {
            return <Redirect to={{pathname: '/invalid-room-code'}}></Redirect>
        }

        let roomCodeCopy;
        if (this.state.roomKey !== null) {
            roomCodeCopy = <CopyRoomCode roomCode={roomCode}></CopyRoomCode>
        }

        var pageBrowser = <p></p>
        if (this.state.PDFDocument !== null) {
            pageBrowser = [...Array(this.state.numPages).keys()].map((number, index) =>
                                <div className='browser-page-and-number-container'>
                                    <div id={`browser-${index + 1}`} style={{'minHeight': 280, 'width': 200, 'backgroundColor': 'white', 'backgroundSize':'cover'}} onClick={this.scrollToPage}>
                                    </div>
                                    <p className='browser-page-number'>{index + 1}</p>
                                </div>
                            )
        }

        return (
            <div className='collab-page' onMouseMove={this.mouseMove}>
    
                {/* HEADER */}
                <div className='header'>
                    <a className='cosign-header-text' href="/">Cosign</a>
                    <div className='tools'>
                        <Signature setURL={this.setSignatureURL}/>
                    </div>
                    {roomCodeCopy}
                </div>
                {/* /HEADER */}
    
                {/* BODY */}
                {/* don't render until we receive the document from the server */}
                <div className='body-container'>
                    <div id='browser-canvas-container'>
                        {pageBrowser}
                    </div> 
                    {givenPDFDocument !== null && socket !== null ?
                        <Document
                            file={givenPDFDocument}
                            onLoadSuccess={(pdf) => this.onDocumentLoadSuccess(pdf)}
                        >
                                <div id='canvas-container'>
                                    {/* just render the first page to get width and height data */}
                                    <div key={1}>
                                        <div className='page-and-number-container' id={`container-1`}>
                                            <Page 
                                                scale={1.5}
                                                pageNumber={1}
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                                onLoadSuccess={(page) => this.onPageLoadSuccess(page)}
                                                className={'1'}
                                                onRenderSuccess={() => this.setState({
                                                    firstPageRendered: true
                                                })}
                                            />
                                            <p className='page-number'>1</p>
                                        </div>
                                    </div>
                                    {/* rest of the pages are to be loaded if they are in view */}
                                    {this.inViewElements}
                                </div>
                        
                        </Document>
                    : null}
                </div>
                {/* /BODY */}
    
                {/* FOOTER */}
                <div className='header'> 
                    <div className='download-button-container'>
                        <Dropdown drop='up'>
                            <Dropdown.Toggle>
                                Users: {this.state.currentUsers.length}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {this.state.currentUsers.map((user) => (
                                    <Dropdown.Item>{user}</Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div className='tools'>
                        {/* <Alert variant='success' show={this.state.usersJoinedAlertVisible}>
                            {this.state.newUser} has entered the room.
                        </Alert>
                        <Alert variant='warning ' show={this.state.usersDisconnectedAlertVisible}>
                            {this.state.disconnectedUser} has left the room.
                        </Alert> */}
                    </div>
                    <div className='download-button-container'>
                        <Button className='download-button' onClick={event => this.downloadProc(event)}>
                            Download
                        </Button>
                    </div>
                </div>
                {/* /FOOTER */}
    
    
                {holding && <img src={signatureURL} alt='signature-placeholder' id="signature-placeholder"></img>}
                <Alert variant='danger' show={this.state.disconnected}>
                    You are currently disconnected. The changes you make might not be saved. 
                </Alert>
            </div>
            )
        }
    }
    
    export default CollabPageNew