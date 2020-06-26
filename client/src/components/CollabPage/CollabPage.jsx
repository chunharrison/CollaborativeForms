import React from 'react';

// Components
import Signature from '../Signature/Signature';
import { Redirect } from 'react-router-dom'; // open source
import CopyRoomCode from '../CopyRoomCode/CopyRoomCode';
import FreedrawOptions from '../FreedrawOptions/FreedrawOptions';
import HighlighterOptions from '../HighlighterOptions/HighlighterOptions';
import TextOptions from '../TextOptions/TextOptions';
import { TacoTable, DataType, SortDirection, Formatters, Summarizers, TdClassNames } from 'react-taco-table'; // open source
import LoadDoc from '../LoadDoc/LoadDoc'
// import PilotMode from '../PilotMode/PilotMode'

// react-bootstrap
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';

// Libraries
import { fabric } from 'fabric';
import { nanoid } from 'nanoid';
import io from "socket.io-client";
import queryString from 'query-string';
import axios from 'axios';
import { PDFDocument } from 'pdf-lib';
import download from 'downloadjs';
import Tour from 'reactour';
import jwt_decode from "jwt-decode";
// redux
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { setCurrentDoc } from '../../actions/docActions'
import { setUserSocket } from '../../actions/roomActions'

// // PDF document (for dev)
// import PDF from '../docs/sample.pdf';
import setAuthToken from "../../utils/setAuthToken";

//CSS
import './CollabPage.css';
import 'react-taco-table/dist/react-taco-table.css';

class CollabPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            givenPDFDocument: null,

            // Document info
            numPages: 0, // number of pages the document have
            pagesArray: [],
            pageDimensions: [],

            // Render
            dataURLFormat: 'image/png', // the argument we pass into all toDataURL functions

            //User info
            username:'',
            currentObjectOwner: null,
            
            // Signature
            signatureURL: null,
            pageX: 0,
            pageY: 0,
            holding: false,

            //Shapes and Drawing
            mode: 'select',
            isDown: false,
            origX: 0,
            origY: 0,
            rect: null,
            brushSize: 1,
            opacity: 100,
            selectedColor: 'rgb(0, 0, 0)',
            dropdown: false,

            //highlighter
            highlighterBorderThickness: 1,
            highlighterOpacity: 100,
            highlighterBorderColor: 'rgb(0, 0, 0)',
            highlighterFillColor: 'rgb(0, 0, 0)',

            //text
            textFontSize: 10,
            textOpacity: 100,
            textColor: 'rgb(0, 0, 0)',

            // Zoom (To Be Implemented)
            currentZoom: 1,
            testScale: 1,
            testPageRendered: false,
            pageDimensions: [],


            // Pilot Mode
            pmActivated: false,
            pmWaitConfirmModalShow: false,
            pmRequesterUsername: null,
            pmConfirmModalShow: false,
            pmDriver: null,
            pmIsDriver: false,
            pmWaitConfirmTableRows: [],
            pmWaitNumAccepts: 0,
            // // button
            pmButtonVariant: 'info',
            pmButtonLabel: 'Activate',

            // Server
            endpoint: `${process.env.REACT_APP_BACKEND_ADDRESS}`,
            socket: null,
            disconnected: false,
            invalidRoomCodeGiven: false,
            currentUsers: {}
        }

        // Render
        this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
        this.renderFabricCanvas = this.renderFabricCanvas.bind(this);

        // Download 
        this.downloadProc = this.downloadProc.bind(this);

        // Browser Functionality
        this.scrollToPage = this.scrollToPage.bind(this);

        // Shapes and drawing tools
        this.toggleSelect = this.toggleSelect.bind(this);
        this.toggleHighlighter = this.toggleHighlighter.bind(this);
        this.toggleFreeDraw = this.toggleFreeDraw.bind(this);
        this.toggleText = this.toggleText.bind(this);
        this.updateBrushSize = this.updateBrushSize.bind(this);
        this.updateOpacity = this.updateOpacity.bind(this);
        this.updateColor = this.updateColor.bind(this);
        this.updateHighlighterBorderColor = this.updateHighlighterBorderColor.bind(this);
        this.updateHighlighterFillColor = this.updateHighlighterFillColor.bind(this);
        this.updateHighlighterBorderThickness = this.updateHighlighterBorderThickness.bind(this);
        this.updateHighlighterOpacity = this.updateHighlighterOpacity.bind(this);
        this.updateTextFontSize = this.updateTextFontSize.bind(this);
        this.updateTextOpacity = this.updateTextOpacity.bind(this);
        this.updateTextColor = this.updateTextColor.bind(this);
        this.zoomIn = this.zoomIn.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
        // Signature
        this.mouseMove = this.mouseMove.bind(this);
        this.setSignatureURL = this.setSignatureURL.bind(this);
        this.addImage = this.addImage.bind(this);
        this.delObject = this.delObject.bind(this);

        // Pilot Mode
        this.handleClosePilotConfirmModal = this.handleClosePilotConfirmModal.bind(this)
        this.handlePMButtonClick = this.handlePMButtonClick.bind(this)

        // Backend
        this.setSocket = this.setSocket.bind(this);
        this.invalidRoomCodeProc = this.invalidRoomCodeProc.bind(this);

        // Component Variables
        this.inViewElements = null;
        this.currentCanvas = null;
        this.fabricCanvases = [];

        // Intro
        this.closeTour = this.closeTour.bind(this);

        this.test = this.test.bind(this)


        this.canvasContainerRef = React.createRef()
    }


    /* #################################################################################################
    ############################################ Document ##############################################
    ################################################################################################# */

    // procs when the document is successfully loaded by the Document component from react-pdf
    // retrieves the number of pdf pages and store it in state
    onDocumentLoadSuccess = (pdf) => {
        // console.log(pdf)
        const PA = Array.from(Array(pdf.numPages), (_, i) => i + 1) // [1, 2, ..., pdf.numPages]
        const dimensionArray = new Array(pdf.numPages)
        // console.log(PA)
        this.setState({
            numPages: pdf.numPages,
            pagesArray: PA,
            pageDimensions: dimensionArray
        })
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
            socket.emit('getCurrentPageSignatures', pageNum, function (currentPageSignaturesJSONList) {
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
    ######################################### Shapes and Drawings ####################################
    ################################################################################################# */

    //tool toggles

    toggleSelect() {
        this.setState({ mode: 'select' });
    }

    toggleHighlighter() {
        this.setState({
            mode: 'highlighter',
            dropdown: !this.state.dropdown
        });
    }

    toggleFreeDraw() {
        this.setState({
            mode: 'freedraw',
            dropdown: !this.state.dropdown
        });
    }

    toggleText() {
        this.setState({
            mode: 'text',
            dropdown: !this.state.dropdown
        });
    }

    //Freedraw functions

    updateBrushSize(e) {
        this.setState({ brushSize: e.target.value })
    }

    updateOpacity(e) {
        this.setState({ opacity: e.target.value })
    }

    updateColor(e) {
        this.setState({ selectedColor: e.target.style.backgroundColor });
        let ColorBlocks = document.getElementsByClassName('Color-block');
        for (let i = 0; i < ColorBlocks.length; i++) {
            ColorBlocks[i].classList.remove('active-Color');
        }

        e.target.classList.add('active-Color');
    }

    //Highlighter functions
    updateHighlighterBorderThickness(e) {
        this.setState({ highlighterBorderThickness: e.target.value })
    }

    updateHighlighterOpacity(e) {
        this.setState({ highlighterOpacity: e.target.value })
    }

    updateHighlighterFillColor(e) {
        this.setState({ highlighterFillColor: e.target.style.backgroundColor });
        let ColorBlocks = document.getElementsByClassName('Color-block');
        for (let i = 0; i < ColorBlocks.length; i++) {
            ColorBlocks[i].classList.remove('active-Color');
        }

        e.target.classList.add('active-Color');
    }

    updateHighlighterBorderColor(e) {
        this.setState({ highlighterBorderColor: e.target.style.backgroundColor });
        let ColorBlocks = document.getElementsByClassName('Color-block');
        for (let i = 0; i < ColorBlocks.length; i++) {
            ColorBlocks[i].classList.remove('active-Color');
        }

        e.target.classList.add('active-Color');
    }

    //Text functions
    updateTextFontSize(e) {
        this.setState({ textFontSize: e.target.value })
    }

    updateTextOpacity(e) {
        this.setState({ textOpacity: e.target.value })
    }

    updateTextColor(e) {
        this.setState({ textColor: e.target.style.backgroundColor });
    }

    //Zoom
    zoomOut() {
        if (this.state.currentZoom >= 0.4) {
            this.setState({
                currentZoom: this.state.currentZoom-0.2
            }, () => {
                for (let i = 0; i < this.state.pagesArray.length; i++) {
                    const currentPageNum = this.state.pagesArray[i]
                    if (document.getElementById(currentPageNum.toString())) {
                        let fabricElement = document.getElementById(currentPageNum.toString()).fabric
                        fabricElement.setZoom(this.state.currentZoom)
                        fabricElement.setWidth(this.state.pageDimensions[i].width * this.state.currentZoom)
                        fabricElement.setHeight(this.state.pageDimensions[i].height * this.state.currentZoom)
                    }
                }
            })
        }
    }

    zoomIn() {
        if (this.state.currentZoom <= 5) {
            this.setState({
                currentZoom: this.state.currentZoom+0.2
            }, () => {
                for (let i = 0; i < this.state.pagesArray.length; i++) {
                    const currentPageNum = this.state.pagesArray[i]
                    if (document.getElementById(currentPageNum.toString())) {
                        let fabricElement = document.getElementById(currentPageNum.toString()).fabric
                        fabricElement.setZoom(this.state.currentZoom)
                        fabricElement.setWidth(this.state.pageDimensions[i].width * this.state.currentZoom)
                        fabricElement.setHeight(this.state.pageDimensions[i].height * this.state.currentZoom)
                    }
                }
            })
        }
    }

    /* #################################################################################################
    ############################################ Signature #############################################
    ################################################################################################# */

    mouseMove(e) {
        if (this.state.holding) {
            let image = document.getElementById('signature-placeholder')
            image.style.top = e.pageY + 'px';
            image.style.left = e.pageX + 'px';
        }
    }

    // parent function for the signature component
    // sets the image url to the current singaure being held by the cursor
    setSignatureURL(signatureURL, e) {
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
    addImage(currentCanvas, url, x, y) {
        let self = this;

        // create FabricJS Image object to place on the FabricJS Canvas object 
        fabric.Image.fromURL(url, function (signature) {
            // set a unique id, and corresponding padding for the signature object
            var img = signature.set({
                id: nanoid(),   // id
                left: (x - signature.width / 2) / self.state.currentZoom,   // left padding
                top: (y - signature.height / 2) / self.state.currentZoom    // top padding
            });
            currentCanvas.add(img);
        });

        // released
        this.setState({ holding: false });
    }

    // deletes the signatures on the canvas that are selected
    delObject(event) {
        if (event.keyCode === 46) {
            this.setState({ holding: false });
            for (let pageNum = 0; pageNum < this.state.numPages; pageNum++) {
                let currentPageCanvas = document.getElementById(pageNum.toString());
                if (typeof currentPageCanvas === 'object' && currentPageCanvas !== null) {
                    let currentPageFabricCanvas = currentPageCanvas.fabric;
                    var activeObject = currentPageFabricCanvas.getActiveObjects()
                    if (activeObject.length > 0) {
                        this.setState({ toSend: true }, () => {
                            currentPageFabricCanvas.discardActiveObject();
                            currentPageFabricCanvas.remove(...activeObject);
                            currentPageFabricCanvas.renderAll();
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
            fabric.util.enlivenObjects([newSignatureObjectJSON], function (newSignatureObject) {
                let fabricCanvasObject = document.getElementById(pageNum.toString()).fabric;
                fabricCanvasObject.add(newSignatureObject[0]);
                fabricCanvasObject.renderAll();
            })
        }
    }

    receiveEdit(pageData) {
        const { pageNum, modifiedSignatureObjectJSON } = pageData
        if (document.getElementById(pageNum.toString()) !== null) {
            fabric.util.enlivenObjects([modifiedSignatureObjectJSON], function (modifiedSignatureObject) {
                let fabricCanvasObject = document.getElementById(pageNum.toString()).fabric;

                // let origRenderOnAddRemove = fabricCanvasObject.renderOnAddRemove;
                fabricCanvasObject.renderOnAddRemove = false;

                fabricCanvasObject.getObjects().forEach(function (currentSignatureObject) {
                    if (modifiedSignatureObject[0].id === currentSignatureObject.id) {
                        currentSignatureObject.set({
                            'top': modifiedSignatureObject[0].top,
                            'left': modifiedSignatureObject[0].left,
                            'width': modifiedSignatureObject[0].width,
                            'height': modifiedSignatureObject[0].height,
                            'angle': modifiedSignatureObject[0].angle,
                            'scaleX': modifiedSignatureObject[0].scaleX,
                            'scaleY': modifiedSignatureObject[0].scaleY,
                            'skewX': modifiedSignatureObject[0].skewX,
                            'skewY': modifiedSignatureObject[0].skewY,
                        });

                        if (modifiedSignatureObject[0].text) {
                            currentSignatureObject.set({ 'text': modifiedSignatureObject[0].text })

                        };

                        currentSignatureObject.setCoords();
                        fabricCanvasObject.renderAll();
                    }
                })
            })
        }
    }

    receiveDelete(pageData) {
        const { pageNum, removedSignatureObjectJSON } = pageData
        if (document.getElementById(pageNum.toString()) !== null) {
            fabric.util.enlivenObjects([removedSignatureObjectJSON], function (removedSignatureObjects) {
                // get the signature object
                let removedSignatureObject = removedSignatureObjects[0]
                // fabric canvas object of the pageNum
                let fabricCanvasObject = document.getElementById(pageNum.toString()).fabric
                fabricCanvasObject.getObjects().forEach(function (currentSignatureObject) {
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

    getDocument() {
        // request PDF
        const generateGetUrl = `${process.env.REACT_APP_BACKEND_ADDRESS}/api/generate-get-url`;
        const options = {
            params: {
                Key: `${roomCode}.pdf`,
                ContentType: 'application/pdf'
            },
            headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'application/pdf',
            },
        };
        axios.get(generateGetUrl, options).then(res => {
            const { data: getURL } = res;
            this.setState({ getURL });
            //get the data with the url that was given, then turn the data into a blob, which is the representation of a file without a name. this can be fed to a pdf render
            fetch(getURL)
                .then(response => response.blob()).then((blob) => {
                    setCurrentDoc(blob) // redux
                    this.setState({ givenPDFDocument: blob })
                })
        });
    }

    setSocket(username, roomCode, action) {
        // Socket.io
        const socket = io(this.state.endpoint);
        setUserSocket(socket) // redux
        // when a user joins, send the server the username to be stored 
        // and the roomcode to update the correct database
        // the server then emits an initial setup with:
        //      the document file, existing signature object and the list of people in the room
        socket.on('join', () => {
            const creation = action === 'create' ? true : false;
            const socketID = socket.id;

            // const token = localStorage.jwtToken;
            // setAuthToken(token);
            // // Decode token and get user info and exp
            // const decoded = jwt_decode(token);
            

            // socket.emit('join', { socketID, username, roomCode, creation, userID: decoded.id })
            socket.emit('join', { socketID, username, roomCode, creation });
        });

        // Connection
        socket.on('disconnect', () => {
            this.setState({ disconnected: true });
        })
        socket.on('reconnect', () => {
            // console.log('reconnected')
            window.location.reload();
            this.setState({ disconnected: false });
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


        // Pilot Mode

        socket.on("confirmPilotMode", (requestData) => {
            // console.log(currNumUsers)
            const { requesterUsername, requesterSocketID, currNumUsers } = requestData
            this.setState({
                pmConfirmModalShow: true,
                pmRequesterUsername: requesterUsername,
                pmRequesterSocketID: requesterSocketID,
                pmCurrNumUsers: currNumUsers
            })
        })

        socket.on("pilotModeUserAccepted", (confirmingUserSocketID) => {
            this.state.pmWaitConfirmTableRows.forEach((item) => {
                if (item.socketID === confirmingUserSocketID) {
                    item['status'] = 'Accepted'
                }
            })

            
            this.setState({ pmWaitNumAccepts: this.state.pmWaitNumAccepts + 1 }, () => {
                console.log(this.state.pmWaitConfirmTableRows.length, this.state.pmWaitNumAccepts)
                if (this.state.pmWaitConfirmTableRows.length === this.state.pmWaitNumAccepts) {
                    document.addEventListener('scroll', this.sendScrollPercent, true);

                    const token = localStorage.jwtToken;
                    setAuthToken(token);
                    // Decode token and get user info and exp
                    const decoded = jwt_decode(token);

                    setTimeout(this.setState({
                        // send scroll percentage
                        pmActivated: true,

                        // 
                        pmWaitConfirmModalShow: false,
                        pmButtonLabel: 'Cancel',
                        pmButtonVariant: 'danger',
                        pmIsDriver: true,
                    }), 2500)
                    socket.emit('pilotModeActivated', {username: this.state.username, driverID: decoded.id})
                }
            })
        })

        socket.on("pilotModeDeclined", (confirmingUserSocketID) => {
            // console.log(`pilot mode activation failed, ${username} declined the request`)

            this.state.pmWaitConfirmTableRows.forEach((item) => {
                if (item.socketID === confirmingUserSocketID) {
                    item['status'] = 'Declined'
                }
            })

            setTimeout(this.setState({
                pmWaitConfirmModalShow: false,
                pmWaitNumAccepts: 0
            }), 2500)
        })

        // socket.on("pilotModeConfirmed", () => {
        //     console.log("pilot mode activated")
        //     setTimeout(this.setState({
        //         // send scroll percentage
        //         pmActivated: true,

        //         // 
        //         pmWaitConfirmModalShow:false,
        //         pmButtonLabel: 'Cancel',
        //         pmButtonVariant: 'danger',
        //         pmIsDriver: true,
        //     }, () => socket.emit('pilotModeActivated', this.state.username)),
        //     2500)
        // })

        socket.on("setScrollPercent", (scrollPercent) => {
            // console.log("setScrollPercent")
            this.canvasContainerRef.current.scrollTop = scrollPercent
        })

        socket.on('pilotModeStopped', () => {
            // reactivate scroll effects
            console.log('pilotModeStopped')
            this.setState({
                pmActivated: false,
                pmDriver: false,
                pmButtonVariant: 'info',
                pmButtonLabel: 'Activate'
            })
        })

        // person is using the pilot mode right now for the room
        socket.on('pilotModeActivatedByUser', (driverUsername) => {
            // console.log("PILOTMODEACTIVATREDDGDKFNGSJGFSGF")
            this.setState({
                pmActivated: true,
                pmDriver: driverUsername,
                pmButtonVariant: 'warning',
                pmButtonLabel: 'Activated'
            })
        })

        socket.on('welcomeBackDriver', () => {
            document.addEventListener('scroll', this.sendScrollPercent, true);
            
            setTimeout(this.setState({
                // send scroll percentage
                pmActivated: true,

                // 
                pmWaitConfirmModalShow: false,
                pmButtonLabel: 'Cancel',
                pmButtonVariant: 'danger',
                pmIsDriver: true,
            }), 2500)
        })

        // Signatures
        socket.on("addOut", (pageData) => this.receiveAdd(pageData))
        socket.on("editOut", (pageData) => this.receiveEdit(pageData))
        socket.on("deleteOut", (pageData) => this.receiveDelete(pageData))

        // set socket.io to state
        this.setState({ socket: socket })
    }

    /* #################################################################################################
    ################################################################################################# */
    //Close intro popup
    closeTour() {
        this.setState({ isTourOpen: false })
    }

    test() {
        console.log('sddf')
        this.setState({
            testPageRendered: true
        })
    }


    /* #################################################################################################
    ########################################### Pilot Mode #############################################
    ################################################################################################# */

    getScrollPercent = () => {
        // event.preventDefault()

        // console.log(this.canvasContainerRef.current.scrollTop);
    }

    sendScrollPercent = () => {
        this.state.socket.emit("sendScrollPercent", this.canvasContainerRef.current.scrollTop)
    }

    requestPilotMode = () => {
        // request pilot mode to other users via socket.io and then
        // it returns a callback function 
        // let otherUsers = this.state.currentUsers
        // delete otherUsers[this.state.socket.id]

        // for list of users that need to confirm or decline the request
        let pmWaitConfirmTableRowsNew = []
        const currentUsersEntries = Object.entries(this.state.currentUsers)
        for (const [socketID, username] of currentUsersEntries) {
            if (socketID === this.state.socket.id) {
                continue;
            }
            const rowValues = {
                "socketID": socketID,
                "user": username,
                "status": "Pending"
            }
            pmWaitConfirmTableRowsNew.push(rowValues)
        }

        this.setState({
            pmWaitConfirmModalShow: true,
            pmWaitConfirmTableRows: pmWaitConfirmTableRowsNew
        })

        console.log(this.state.currentUsers)
        const requestData = {
            requesterUsername: this.state.username,
            requesterSocketID: this.state.socket.id,
            currNumUsers: Object.keys(this.state.currentUsers).length - 1,

        }
        this.state.socket.emit("pilotModeRequested", requestData)
    }

    // button that is clicked when the room is in Pilot Mode
    // if the Driver clicks it, it changes the 
    handlePMButtonClick = () => {
        // already activated 
        // console.log('handlePMButtonClick')
        // console.log(this.state.pmActivated, this.state.pmIsDriver)

        // the driver deactivates the Pilot Mode 
        if (this.state.pmActivated && this.state.pmIsDriver) {
            document.removeEventListener('scroll', this.sendScrollPercent, true);
            this.setState({
                pmActivated: false,
                pmButtonVariant: 'info',
                pmButtonLabel: 'Activate',
                pmIsDriver: false,

                pmWaitNumAccepts: 0
            }, () => {
                this.state.socket.emit('pilotModeStopped')
            })
        }

        // 
        else if (!this.state.pmActivated && !this.state.pmIsDriver) {
            this.requestPilotMode()
        }
    }

    handleClosePilotConfirmModal = (event, confirmed) => {
        event.preventDefault()
        console.log(this.state.pmCurrNumUsers)
        this.setState({
            pmConfirmModalShow: false,
        })

        const callbackData = {
            confirmed: confirmed,
            confirmingUser: this.state.username,
            confirmingUserSocketID: this.state.socket.id,
            requesterSocketID: this.state.pmRequesterSocketID,
            currNumUsers: this.state.pmCurrNumUsers
        }

        this.state.socket.emit("pilotModeRequestCallback", callbackData)
    }

    handleClosePilotWaitingModal = (event) => {
        event.preventDefault()
        this.setState({
            pmWaitConfirmModalShow: false
        })
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
        this.setState({ username, roomCode, action }, () => {
            this.setSocket(username, roomCode, action); // Socket.io
        });

        let visited = localStorage["collabPageVisited"];
        if (visited) {
            this.setState({ isTourOpen: false });
        } else {
            //this is the first time
            localStorage["collabPageVisited"] = true;
            this.setState({ isTourOpen: true });
        }

    }

    componentDidUpdate(prevProps, prevState) {

        if (prevState.holding === false && this.state.holding === true) {
            let image = document.getElementById('signature-placeholder')
            image.style.top = this.state.pageY + 'px';
            image.style.left = this.state.pageX + 'px';
        }

        // Pilot Mode
        // prevState.pmActivated !== this.state.pmActivated && 
        // if (this.state.pmActivated && this.state.pmIsDriver) {
        //     // console.log(this.state.pmActivated, this.state.pmIsDriver)
        //     document.addEventListener('scroll', this.sendScrollPercent);
        // }

    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.delObject, false);
    }


    /* #################################################################################################
    ################################################################################################# */

    render() {
        // State Variables 
        const { givenPDFDocument, roomCode, socket, signatureURL, holding, invalidRoomCodeGiven,
            pmWaitConfirmModalShow, pmConfirmModalShow, pmRequesterUsername,
            pmButtonLabel, pmButtonVariant, pmDriver, pmWaitConfirmTableRows, 
            currentZoom } = this.state;

        if (invalidRoomCodeGiven) {
            return <Redirect to={{ pathname: '/invalid-room-code' }}></Redirect>
        }

        let roomCodeCopy;
        if (this.state.roomKey !== null) {
            roomCodeCopy = <CopyRoomCode roomCode={roomCode}></CopyRoomCode>
        }

        var pageBrowser = <p></p>
        if (this.state.PDFDocument !== null) {
            pageBrowser = [...Array(this.state.numPages).keys()].map((number, index) =>
                <div className='browser-page-and-number-container' key={`browser-page-${index}`}>
                    <div id={`browser-${index + 1}`} style={{ 'minHeight': 280, 'width': 200, 'backgroundColor': 'white', 'backgroundSize': 'cover' }} onClick={this.scrollToPage}>
                    </div>
                    <p className='browser-page-number'>{index + 1}</p>
                </div>
            )
        }

        let downloadLoader = (givenPDFDocument === null ? <div style={{ height: '500px' }}>
            <div class="loader-wrapper">
                <span class="circle circle-1"></span>
                <span class="circle circle-2"></span>
                <span class="circle circle-3"></span>
                <span class="circle circle-4"></span>
                <span class="circle circle-5"></span>
                <span class="circle circle-6"></span>
            </div>
        </div> : null)

        let documentLoader = <div style={{ height: '500px' }}>
            <div class="loader-wrapper">
                <span class="circle circle-1"></span>
                <span class="circle circle-2"></span>
                <span class="circle circle-3"></span>
                <span class="circle circle-4"></span>
                <span class="circle circle-5"></span>
                <span class="circle circle-6"></span>
            </div>
        </div>

        //Order in which insturcitons will appear
        const steps = [
            {
                selector: '',
                content: 'Welcome to the collaboration page! On this page, you can view and sign documents hosted by the owner of the room.',
            },
            {
                selector: '.react-pdf__Document',
                content: 'The main area is where the selected PDF should appear after the initial setup.',
            },
            {
                selector: '#browser-canvas-container',
                content: 'The page explorer can be used to navigate between pages faster by clicking on them.',
            },
            {
                selector: '.signature-button',
                content: 'A signature can be made then placed on the PDF by clicking the signature button.',
            },
            {
                selector: '.clipboard-container',
                content: 'The room code is a unique string of characters that can be shared with other parties intending on joining the room.',
            },
            {
                selector: '.download-button',
                content: 'If enabled by the room owner, this document and the signatures placed can be downloaded and saved on to local storage',
            },
        ]


        // Pilot Mode
        const pmWaitColumns = [
            {
                id: 'user',
                type: DataType.String,
                header: 'User',
            },
            {
                id: 'status',
                type: DataType.String,
                header: 'Status',
                tdStyle(cellData) {
                    if (cellData === "Pending") {
                        return { color: '#CCCC00' };
                    } else if (cellData === "Accepted") {
                        return { color: 'green' };
                    } else if (cellData === "Declined") {
                        return { color: '#DC143C' };
                    }

                    return undefined;
                }
            }
        ]

        return (
            <div className='collab-page' onMouseMove={this.mouseMove}>

                {/* HEADER */}
                <div className='header'>
                    <a className='cosign-header-text' href="/">Cosign</a>
                    <div className='tools'>
                        <Signature setURL={this.setSignatureURL} />
                        <button onClick={this.toggleSelect}>Select</button>
                        <div className='dropdown'>
                            <button onClick={this.toggleHighlighter}>Highlighter</button>
                            {(this.state.dropdown && this.state.mode === 'highlighter') ?
                                <HighlighterOptions className='tool-options'
                                    highlighterOpacity={this.state.highlighterOpacity}
                                    highlighterBorderThickness={this.state.highlighterBorderThickness}
                                    highlighterFillColor={this.state.highlighterFillColor}
                                    highlighterBorderColor={this.state.highlighterBorderColor}
                                    updateHighlighterFillColor={this.updateHighlighterFillColor}
                                    updateHighlighterBorderColor={this.updateHighlighterBorderColor}
                                    updateHighlighterBorderThickness={this.updateHighlighterBorderThickness}
                                    updateHighlighterOpacity={this.updateHighlighterOpacity} />
                                : null}
                        </div>
                        <div className='dropdown'>
                            <button onClick={this.toggleFreeDraw} style={{ height: '100%' }}>Free Draw</button>
                            {(this.state.dropdown && this.state.mode === 'freedraw') ?
                                <FreedrawOptions className='tool-options'
                                    opacity={this.state.opacity}
                                    brushSize={this.state.brushSize}
                                    selectedColor={this.state.selectedColor}
                                    updateBrushSize={this.updateBrushSize}
                                    updateOpacity={this.updateOpacity}
                                    updateColor={this.updateColor} />
                                : null}
                        </div>
                        <div className='dropdown'>
                            <button onClick={this.toggleText}>Text</button>
                            {(this.state.dropdown && this.state.mode === 'text') ?
                                <TextOptions className='tool-options'
                                    textOpacity={this.state.textOpacity}
                                    textFontSize={this.state.textFontSize}
                                    textColor={this.state.textColor}
                                    updateTextOpacity={this.updateTextOpacity}
                                    updateTextFontSize={this.updateTextFontSize}
                                    updateTextColor={this.updateTextColor} />
                                : null}
                        </div>
                        <button onClick={this.zoomOut}>Zoom Out</button>
                        <button onClick={this.zoomIn}>Zoom In</button>
                        <p className="page-number">{Math.floor(this.state.currentZoom * 100)}%</p>
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
                    {/* loader waiting for download */}
                    {givenPDFDocument !== null && socket !== null 
                        ?
                    <LoadDoc document={givenPDFDocument} socket={socket} scale={this.state.currentZoom}/>
                        : 
                    downloadLoader}
                </div>
                {/* /BODY */}

                {/* FOOTER */}
                <div className='header'>
                    <div className='download-button-container'>
                        <Button
                            variant={pmButtonVariant}
                            className="pilot-mode-button"
                            onClick={this.handlePMButtonClick}>
                            Pilot Mode: {pmButtonLabel} {pmDriver ? <Badge variant="dark">{pmDriver}</Badge> : null}
                        </Button>
                        <Dropdown drop='up'>
                            <Dropdown.Toggle>
                                Users  <Badge variant="light">{Object.keys(this.state.currentUsers).length}</Badge>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {Object.entries(this.state.currentUsers).map(([socketid, username], i) => (
                                    <Dropdown.Item>{username}</Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div className='tools'>
                        {/*  */}
                    </div>
                    <div className='download-button-container'>
                        <Button className='download-button' onClick={event => this.downloadProc(event)}>
                            Download
                        </Button>
                    </div>
                </div>
                {/* /FOOTER */}


                {holding && <img src={signatureURL} alt='signature-placeholder' id="signature-placeholder"></img>}
                <div onScroll={this.getScrollPercent}></div>
                <Alert variant='danger' show={this.state.disconnected}>
                    You are currently disconnected. The changes you make might not be saved.
                </Alert>
                <Tour
                    steps={steps}
                    isOpen={this.state.isTourOpen}
                    onRequestClose={this.closeTour} />

                {/* Pilot Mode */}
                {/* confirmation window */}
                <Modal show={pmConfirmModalShow} backdrop="static">
                    <Modal.Header>
                        <Modal.Title>Pilot Mode Requested</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='modal-body'>
                        <p>{pmRequesterUsername} has requested to be in charge of scrolling through the document.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" onClick={(event) => this.handleClosePilotConfirmModal(event, true)}>
                            Confirm
                    </Button>
                        <Button variant="danger" onClick={(event) => this.handleClosePilotConfirmModal(event, false)}>
                            Deny
                    </Button>
                    </Modal.Footer>
                </Modal>
                {/* waiting window */}
                <Modal show={pmWaitConfirmModalShow} backdrop="static">
                    <Modal.Header>
                        <Modal.Title>Waiting Pilot Mode Confirmation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='modal-body'>
                        <TacoTable
                            className="pilot-mode-modal-table"
                            columns={pmWaitColumns}
                            columnHighlighting
                            data={pmWaitConfirmTableRows}
                            striped
                            sortable
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={(event) => this.handleClosePilotWaitingModal(event)}>
                            Cancel
                    </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

CollabPage.propTypes = {
    setUserSocket: PropTypes.func.isRequired,
    setCurrentDoc: PropTypes.func.isRequired,
    userSocket: PropTypes.object.isRequired,
    currentDoc: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    userSocket: state.room.userSocket,
    currentDoc: state.doc.currentDoc,
})


export default connect(mapStateToProps, { setUserSocket, setCurrentDoc })(CollabPage)