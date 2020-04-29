import React from 'react';

// Components
import LoadPage from '../LoadPage/LoadPage';
import { Document, Page } from 'react-pdf'; // open source
import Signature from '../Signature/Signature';
import { Redirect } from 'react-router-dom'; // open source

// Libraries
import { fabric } from 'fabric';
import { nanoid } from 'nanoid';
import io from "socket.io-client";
import queryString from 'query-string';

// PDF document (for dev)
import PDF from '../docs/sample.pdf';

//CSS
import './CollabPage.css';

class CollabPageNew extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            PDFDocument: null,
            currentUsers: [],

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
            socket: null,
            // socket: true
        }

        // Render
        this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
        this.renderFabricCanvas = this.renderFabricCanvas.bind(this);
        this.onPageLoadSuccess = this.onPageLoadSuccess.bind(this);
        

        // Signature
        this.mouseMove = this.mouseMove.bind(this);
        this.setSignatureURL = this.setSignatureURL.bind(this);
        this.addImage = this.addImage.bind(this);
        this.delObject = this.delObject.bind(this);

        // Backend
        this.setSocket = this.setSocket.bind(this);

        // Component Variables
        this.inViewElements = null; 
        this.fabricCanvases = [];
    }
    
    
    /* #################################################################################################
    ############################################ Document ##############################################
    ################################################################################################# */

    // procs when the document is successfully loaded by the Document component from react-pdf
    // retrieves the number of pdf pages and store it in state
    onDocumentLoadSuccess = (pdf) => {
        console.log(pdf)
        this.setState({
            numPages: pdf.numPages
        }) 
    }

    renderFabricCanvas = (dataURLFormat, width, height, socket, roomCode) => {
        let self = this

        const pageCanvasWrapperElement = document.getElementsByClassName('react-pdf__Page 1')[0]
        const pageCanvasElement = pageCanvasWrapperElement.firstElementChild
        pageCanvasElement.id = '1'
        const backgroundImg = pageCanvasElement.toDataURL(dataURLFormat) // maybe turn this into JSON
        // create fabric canvas element with correct dimensions of the document
        let fabricCanvas = new fabric.Canvas('1', {width: width, height: height})

        // set the background image as what is on the document
        fabric.Image.fromURL(backgroundImg, function(img) {
            // set correct dimensions of the image
            img.scaleToWidth(self.state.width)
            img.scaleToHeight(self.state.height)
            // set the image as background and then render
            fabricCanvas.setBackgroundImage(img)
            fabricCanvas.requestRenderAll()
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
            const pageNum = e.target.canvas.lowerCanvasEl.id;
            const signatureID = e.target.id;
            const signatureObject = e.target
            console.log(e.target)
            if (self.state.toSend) {
                // self.sendEdit(pageNum, signatureID, 'add');
                // socket.emit('editIn', {roomCode, signatureObject})
                self.setState({
                    toSend:false
                });
            }
            
        });

        fabricCanvas.on('object:modified', function(e) {
            const pageNum = e.target.canvas.lowerCanvasEl.id;
            const signatureID = e.target.id;
            const signatureObject = e.target
            // self.sendEdit(pageNum, signatureID, 'modify');
            // socket.emit('editIn', {roomCode, signatureObject})
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
            if (self.state.toSend) {
                // self.sendDelete(e.target.canvas.lowerCanvasEl.id, e.target.id, 'remove');
                self.setState({toSend:false});
            }
            
        });

        fabricCanvas.on('selection:created', function(e) {
            // for (let i = 0; i < self.state.canvas.length; i++) {
            //     if (typeof self.state.canvas[i] !== 'object' || i === parseInt(e.target.canvas.lowerCanvasEl.id)) {
            //         continue;
            //     }
            //     self.state.canvas[i].discardActiveObject().renderAll();

            // }
            fabricCanvas.discardActiveObject().renderAll();
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
                    // renderFabricCanvas={this.renderFabricCanvas}
                />
            )
        }

        return InViewElementList;
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
        console.log(e)
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
            for (let i = 0; i < this.state.canvas.length; i++) {
                if (typeof this.state.canvas[i] === 'object') {
                    var activeObject = this.state.canvas[i].getActiveObjects();
                    if (activeObject.length > 0) {
                        this.setState({toSend: true}, () => {
                            this.state.canvas[i].discardActiveObject();
                            this.state.canvas[i].remove(...activeObject);
                        });
                    }  
                }              
            }
        }     
    }

    /* #################################################################################################
    ################################################################################################# */





    /* #################################################################################################
    ############################################# Backend ##############################################
    ################################################################################################# */

    initialSetup(document, currentUsers) {
        this.setState({
            document,
            currentUsers,
        })
    }

    // request signature objects for a specific page on the server
    // requestSignatureObjects()

    setSocket(username, roomCode) {
        // Socket.io
        const socket = io(this.state.endpoint); 

        // when a user joins, send the server the username to be stored 
        // and the roomcode to update the correct database
        // the server then emits an initial setup with:
        //      the document file, existing signature object and the list of people in the room
        const creation = true;
        socket.on('join', () => {
            socket.emit('join', { username, roomCode, creation })
        });

        socket.on('sendPDFDocument', (PDFDocument) => {
            this.setState({PDFDocument: PDFDocument})
        })
        
        // // get the document file, existing signature object and the list of people in the room
        // socket.on('initialSetup', (document, currentUsers) => {
        //     this.initialSetup(document, currentUsers)
        // })

        // // 
        // socket.on("editOut", (pageData) => this.receiveEdit(pageData))
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
        this.setState({username, roomCode}, () => { 
            this.setSocket(username, roomCode); // Socket.io
        })
        // this.setState()
    }

    componentDidUpdate(prevProps, prevState) {

        // after we extract the correct number of pages, width and height, 
        // generate inview elements for rest of the pages
        if (0 !== this.state.numPages && 0 !== this.state.width && 0 !== this.state.height) {
            this.inViewElements = this.createInViewElements();
        }

        // after the first page is fully rendered, convert it into a fabricJS canvas element
        if (this.state.firstPageRendered) {
            // this.renderFabricCanvas(
            //     this.state.numPages, 
            //     this.state.width, 
            //     this.state.height,
            //     this.state.socket,
            //     this.state.roomCode)
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
        const { PDFDocument, socket, signatureURL, holding } = this.state;

        return (
        <div className='collab-page' onMouseMove={this.mouseMove}>

            {/* HEADER */}
            <div className='header'>
                <a className='cosign-header-text' href="/">Cosign</a>
                <div className='tools'>
                    <Signature setURL={this.setSignatureURL}/>
                </div>
                {/* {roomCodeCopy} */}
            </div>

            {/* BODY */}
            {/* don't render until we receive the document from the server */}
            {PDFDocument !== null && socket !== null ?
                <Document
                    file={PDFDocument}
                    onLoadSuccess={(pdf) => this.onDocumentLoadSuccess(pdf)}
                >
                <div className='body-container'>
                    {/* <div id='browser-canvas-container'>
                        {pageBrowser}
                    </div> */}
                        <div id='canvas-container'>
                            {/* just render the first page to get width and height data */}
                            <div className='page-and-number-container'>
                                <div key={1}>
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
                                </div>
                                <p className='page-number'>1</p>
                            </div>
                            {/* rest of the pages are to be loaded if they are in view */}
                            {this.inViewElements}
                        </div>
                </div>
                </Document>
            : null}
            {holding && <img src={signatureURL} alt='signature-placeholder' id="signature-placeholder"></img>}
        </div>
        )
    }
}

export default CollabPageNew