import React from 'react';

// Components
import Signature from '../Signature/Signature';
import { Redirect } from 'react-router-dom'; // open source
import CopyRoomCode from './CopyRoomCode/CopyRoomCode';
import FreedrawOptions from '../FreedrawOptions/FreedrawOptions';
import HighlighterOptions from '../HighlighterOptions/HighlighterOptions';
import TextOptions from '../TextOptions/TextOptions';
import LoadDoc from './LoadDoc/LoadDoc'
import DownloadDoc from './DownloadDoc/DownloadDoc';
// footer
import PilotMode from './PilotMode/PilotMode'
import PMWaitWindow from './PilotMode/PMWaitWindow'
import PMConfirmWindow from './PilotMode/PMConfirmWindow'
import UsersList from './UsersList/UsersList'

// react-bootstrap
import Alert from 'react-bootstrap/Alert';

// Libraries
import { fabric } from 'fabric';
import { nanoid } from 'nanoid';
import io from "socket.io-client";
import queryString from 'query-string';
import axios from 'axios';
import Tour from 'reactour';

// redux
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { 
    setCurrentDoc, 
    setCanvasContainerRef, 
    setRenderFabricCanvasFunc
} from '../../actions/docActions'
import { 
    setUserSocket, 
    setRoomCode,
    updateCurrentUsers
} from '../../actions/roomActions'
import { setCurrentZoom } from '../../actions/toolActions'

//CSS
import './CollabPage.css';

class CollabPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
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

            // Zoom
            currentZoom: 1,
            testScale: 1,
            testPageRendered: false,
            pageDimensions: [],

            // Server
            endpoint: `${process.env.REACT_APP_BACKEND_ADDRESS}`,
            socket: null,
            disconnected: false,
            invalidRoomCodeGiven: false,
        }

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

    renderFabricCanvas = (pageNum, width, height) => {
        console.log(pageNum, width, height)
        let self = this

        // get the canvas element created by react-pdf
        const pageCanvasWrapperElement = document.getElementsByClassName(`react-pdf__Page ${pageNum}`)[0];
        const pageCanvasElement = pageCanvasWrapperElement.firstElementChild;
        pageCanvasElement.id = pageNum.toString() // set id

        // browser
        // let browserElement = document.getElementById(`browser-${pageNum}`);
        // browserElement.style.backgroundImage = `url(${backgroundImg})`;

        // create fabric canvas element with correct dimensions of the document
        let fabricCanvas = new fabric.Canvas(pageNum.toString(), { 
            width: Math.floor(width), 
            height: Math.floor(height), 
            selection: false 
        });
        document.getElementById(pageNum.toString()).fabric = fabricCanvas;

        // scale
        console.log(this.props.currentZoom, this.props.pageDimensions)
        fabricCanvas.setZoom(this.props.currentZoom)
        fabricCanvas.setWidth(this.props.pageDimensions[pageNum - 1].width * this.props.currentZoom)
        fabricCanvas.setHeight(this.props.pageDimensions[pageNum - 1].height * this.props.currentZoom)

        // if you are joinging an existing room and there are signatures that were already placed
        this.props.userSocket.emit('getCurrentPageSignatures', pageNum, (currentPageSignaturesJSONList) => {
            // Array of JSON -> Array of FabricJS Objects
            fabric.util.enlivenObjects(currentPageSignaturesJSONList, function (signatureObjects) {
                // loop through the array
                signatureObjects.forEach(function (signatureObject) {
                    // add the signature to the page
                    document.getElementById(pageNum.toString()).fabric.add(signatureObject)
                })
            })
        })

        //triggered when mousing over canvas or object
        fabricCanvas.on('mouse:over', function (o) {
            //different conditions for different tools
            //o.target is null when mousing out of canvas
            if (o.target && self.state.mode !== 'select') {
                o.target.hoverCursor = fabricCanvas.defaultCursor;
            } else if (o.target) {
                o.target.hoverCursor = fabricCanvas.hoverCursor;
            }

            if (self.state.mode === 'freedraw') {
                fabricCanvas.isDrawingMode = true;
                fabricCanvas.freeDrawingBrush.width = parseInt(self.state.brushSize);
                let match = self.state.selectedColor.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
                fabricCanvas.freeDrawingBrush.color = `rgb(${match[1]}, ${match[2]}, ${match[3]}, ${self.state.opacity / 100})`;

            }
        });

        //triggered when mousing out of canvas or object
        fabricCanvas.on('mouse:out', function (o) {
            fabricCanvas.isDrawingMode = false;
        });

        //triggers when mouse is clicked down
        fabricCanvas.on('mouse:down', function (o) {
            var pointer = fabricCanvas.getPointer(o.e);
            //add rectangle if highlither tool is used
            if (self.state.mode === 'highlighter') {
                self.setState({
                    isDown: true,
                    origX: pointer.x,
                    origY: pointer.y
                }, () => {
                    let rect = new fabric.Rect({
                        id: nanoid(),
                        left: self.state.origX,
                        top: self.state.origY,
                        originX: 'left',
                        originY: 'top',
                        width: pointer.x - self.state.origX,
                        height: pointer.y - self.state.origY,
                        angle: 0,
                        opacity: self.state.highlighterOpacity / 100,
                        fill: self.state.highlighterFillColor,
                        stroke: self.state.highlighterBorderColor,
                        strokeWidth: parseInt(self.state.highlighterBorderThickness),
                        transparentCorners: false
                    });
                    let obj={owner: self.state.username};
                    rect.set('owner',obj);
                    self.setState({
                        rect: rect,
                        toSend: true
                    }, () => {
                        fabricCanvas.add(rect);

                    })
                });
            }
        });

        //triggers when mouse is moved on canvas
        fabricCanvas.on('mouse:move', function (o) {
            //trigger if left mouse button is pressed
            if (!self.state.isDown) return;
            var pointer = fabricCanvas.getPointer(o.e);
            //resize rectangle if highlighter is selected
            if (self.state.mode === 'highlighter') {
                if (self.state.origX > pointer.x) {
                    self.state.rect.set({ left: Math.abs(pointer.x) });
                }
                if (self.state.origY > pointer.y) {
                    self.state.rect.set({ top: Math.abs(pointer.y) });
                }

                self.state.rect.set({ width: Math.abs(self.state.origX - pointer.x) });
                self.state.rect.set({ height: Math.abs(self.state.origY - pointer.y) });
            }

            fabricCanvas.renderAll();
        });

        //triggers when left mouse button is released
        fabricCanvas.on('mouse:up', function (e) {
            var pointer = fabricCanvas.getPointer(e.e);
            self.setState({ isDown: false });

            if (self.state.mode === 'highlighter') {
                self.state.rect.setCoords();
                const modifiedSignatureObject = self.state.rect;
                const modifiedSignatureObjectJSON = JSON.parse(JSON.stringify(modifiedSignatureObject.toObject(['id', 'owner'])))

                let pageData = {
                    pageNum: pageNum,
                    modifiedSignatureObjectJSON: modifiedSignatureObjectJSON
                }

                self.props.userSocket.emit('editIn', pageData)
            } else if (self.state.mode === 'freedraw') {
                fabricCanvas.isDrawingMode = false;
            } else if (self.state.mode === 'text') {
                self.setState({ toSend: true }, () => {
                    fabricCanvas.add(new fabric.IText('Insert Text', {
                        fontFamily: 'roboto',
                        fontSize: self.state.textFontSize,
                        fill: self.state.textColor,
                        opacity: self.state.textOpacity / 100,
                        left: pointer.x,
                        top: pointer.y,
                        id: nanoid()
                    }));
                    fabricCanvas.renderAll();
                })

                self.setState({ mode: 'select' });
            }

            if (e.target) {
                e.target.lockScalingX = false
                e.target.lockScalingY = false
            }
            if (e.e.target.previousElementSibling !== null) {
                if (self.state.holding) {
                    self.addImage(fabricCanvas, self.state.signatureURL, e.pointer.x, e.pointer.y);
                    self.setState({
                        holding: false,
                        toSend: true
                    });
                }
            }
        });

        fabricCanvas.on('object:selected', function (e) {
            if (self.state.mode !== 'select') {
                fabricCanvas.discardActiveObject().renderAll();
            } else {
                self.setState({currentObjectOwner: e.target.get('owner').owner});
                if (self.state.username !== e.target.get('owner').owner) {
                    e.target.set({'borderColor':'#fbb802','cornerColor':'#fbb802'});
                }
            }


        });

        fabricCanvas.on('selection:updated', function (e) {
            if (self.state.mode !== 'select') {
                fabricCanvas.discardActiveObject().renderAll();
            } else {
                self.setState({currentObjectOwner: e.target.get('owner').owner});
                if (self.state.username !== e.target.get('owner').owner) {
                    e.target.set({'borderColor':'#fbb802','cornerColor':'#fbb802'});
                }
            }


        });

        fabricCanvas.on('before:selection:cleared', function() {
            self.setState({currentObjectOwner: null});
        });

        fabricCanvas.on('object:added', function (e) {
            const newSignatureObject = e.target
            if (!e.target.get('owner')) {
                let obj={owner: self.state.username};
                newSignatureObject.set('owner',obj);
            }
            const newSignatureObjectJSON = JSON.parse(JSON.stringify(newSignatureObject.toObject(['id', 'owner'])))
            let pageData = {
                pageNum: pageNum,
                newSignatureObjectJSON: newSignatureObjectJSON
            }
            if (self.state.toSend) {
                self.props.userSocket.emit('addIn', pageData)
                self.setState({ toSend: false });
            }
        });

        fabricCanvas.on('object:modified', function (e) {
            const modifiedSignatureObject = e.target
            const modifiedSignatureObjectJSON = JSON.parse(JSON.stringify(modifiedSignatureObject.toObject(['id', 'owner'])))

            let pageData = {
                pageNum: pageNum,
                modifiedSignatureObjectJSON: modifiedSignatureObjectJSON
            }

            self.props.userSocket.emit('editIn', pageData)
        });

        fabricCanvas.on('object:moving', function (e) {
            var obj = e.target;

            // if object is too big ignore
            if (obj.getScaledHeight() > obj.canvas.height || obj.getScaledWidth() > obj.canvas.width) {
                return;
            }
            obj.setCoords();
            // top-left  corner
            if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
                obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
                obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
            }
            // bot-right corner
            if (obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height || obj.getBoundingRect().left + obj.getBoundingRect().width > obj.canvas.width) {
                obj.top = Math.min(obj.top, obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top);
                obj.left = Math.min(obj.left, obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left);
            }
        });

        fabricCanvas.on('object:scaling', function (e) {
            var obj = e.target;
            obj.setCoords();

            if (obj.top < 0) {
                obj.lockScalingY = true
                obj.top = 0
            } else if (obj.top + obj.getScaledHeight() > obj.canvas.height) {
                obj.lockScalingY = true
                obj.scaleY = (obj.canvas.height - obj.top) / obj.height
            }

            if (obj.left < 0) {
                obj.lockScalingX = true
                obj.left = 0
            } else if (obj.left + obj.getScaledWidth() > obj.canvas.width) {
                obj.lockScalingX = true
                obj.scaleX = (obj.canvas.width - obj.left) / obj.width
            }
        })

        fabricCanvas.on('object:removed', function (e) {
            const removedSignatureObject = e.target
            const removedSignatureObjectJSON = JSON.parse(JSON.stringify(removedSignatureObject.toObject(['id', 'owner'])))

            let pageData = {
                pageNum: pageNum,
                removedSignatureObjectJSON: removedSignatureObjectJSON
            }

            if (self.state.toSend) {
                self.props.userSocket.emit("deleteIn", pageData)
                self.setState({ toSend: false });
            }

        });

        fabricCanvas.on('text:changed', function (e) {
            const modifiedSignatureObject = e.target
            const modifiedSignatureObjectJSON = JSON.parse(JSON.stringify(modifiedSignatureObject.toObject(['id', 'owner'])))

            let pageData = {
                pageNum: pageNum,
                modifiedSignatureObjectJSON: modifiedSignatureObjectJSON
            }

            self.props.userSocket.emit('editIn', pageData)
        });

        fabricCanvas.on("path:created", function (o) {
            o.path.id = nanoid();
            const newSignatureObject = o.path
            const newSignatureObjectJSON = JSON.parse(JSON.stringify(newSignatureObject.toObject(['id', 'owner'])))
            let pageData = {
                pageNum: pageNum,
                newSignatureObjectJSON: newSignatureObjectJSON
            }

            self.props.userSocket.emit('addIn', pageData);
            self.setState({ toSend: false });
        });

        fabricCanvas.on('selection:created', function (e) {
            for (let i = 1; i <= self.props.numPages; i++) {
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
        if (this.props.currentZoom >= 0.4) {
            let newZoom = this.props.currentZoom - 0.2
            this.props.setCurrentZoom(newZoom)
            for (let pageNum = 1; pageNum <= this.props.numPages; pageNum++) {
                if (document.getElementById(pageNum.toString())) {
                    let fabricElement = document.getElementById(pageNum.toString()).fabric
                    fabricElement.setZoom(newZoom)
                    fabricElement.setWidth(this.props.pageDimensions[pageNum-1].width * newZoom)
                    fabricElement.setHeight(this.props.pageDimensions[pageNum-1].height * newZoom)
                }
            }
        }
    }

    zoomIn() {
        if (this.props.currentZoom <= 5) {
            // this.props.dispatch(this.props.setCurrentZoom(this.props.currentZoom+0.2)
            // .then(()=> {

            // }))
            let newZoom = this.props.currentZoom + 0.2
            this.props.setCurrentZoom(newZoom)
            for (let pageNum = 1; pageNum <= this.props.numPages; pageNum++) {
                if (document.getElementById(pageNum.toString())) {
                    let fabricElement = document.getElementById(pageNum.toString()).fabric
                    fabricElement.setZoom(newZoom)
                    fabricElement.setWidth(this.props.pageDimensions[pageNum-1].width * newZoom)
                    fabricElement.setHeight(this.props.pageDimensions[pageNum-1].height * newZoom)
                }
            }
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
                left: (x - signature.width / 2) / self.props.currentZoom,   // left padding
                top: (y - signature.height / 2) / self.props.currentZoom    // top padding
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
            for (let pageNum = 0; pageNum < this.props.numPages; pageNum++) {
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
                Key: `${this.props.roomCode}.pdf`,
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
                    console.log(blob)
                    this.props.setCurrentDoc(blob) // redux
                    this.setState({ givenPDFDocument: blob })
                })
        });
    }

    setSocket(username, roomCode, action) {
        // Socket.io
        const socket = io(this.state.endpoint);
        this.props.setUserSocket(socket) // redux

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
            this.props.updateCurrentUsers(currentUsers)
        })

        socket.on("invalidRoomCode", () => this.invalidRoomCodeProc())

        // Pilot Mode
        // TODO (HARRISON)
        // socket.on('welcomeBackDriver', () => {
        //     document.addEventListener('scroll', this.sendScrollPercent, true);
            
        //     setTimeout(this.setState({
        //         // send scroll percentage
        //         pmActivated: true,

        //         // 
        //         pmWaitConfirmModalShow: false,
        //         pmButtonLabel: 'Cancel',
        //         pmButtonVariant: 'danger',
        //         pmIsDriver: true,
        //     }), 2500)
        // })

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
        this.props.setRoomCode(roomCode) 
        this.setState({ username, roomCode, action }, () => {
            this.setSocket(username, roomCode, action); // Socket.io
            this.getDocument()
        });

        this.props.setCanvasContainerRef(this.canvasContainerRef)
        this.props.setRenderFabricCanvasFunc(this.renderFabricCanvas)

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

    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.delObject, false);
    }


    /* #################################################################################################
    ################################################################################################# */

    render() {
        // State Variables 
        const { signatureURL, holding, invalidRoomCodeGiven,
            pmWaitConfirmModalShow, pmConfirmModalShow, pmRequesterUsername,
            pmButtonLabel, pmButtonVariant, pmDriver, } = this.state;

        if (invalidRoomCodeGiven) {
            return <Redirect to={{ pathname: '/invalid-room-code' }}></Redirect>
        }

        let roomCodeCopy;
        if (this.state.roomKey !== null) {
            roomCodeCopy = <CopyRoomCode roomCode={this.props.roomCode}></CopyRoomCode>
        }

        var pageBrowser = <p></p>
        if (this.props.currentDoc !== null) {
            pageBrowser = [...Array(this.props.numPages).keys()].map((number, index) =>
                <div className='browser-page-and-number-container' key={`browser-page-${index}`}>
                    <div id={`browser-${index + 1}`} style={{ 'minHeight': 280, 'width': 200, 'backgroundColor': 'white', 'backgroundSize': 'cover' }} onClick={this.scrollToPage}>
                    </div>
                    <p className='browser-page-number'>{index + 1}</p>
                </div>
            )
        }

        let downloadLoader = (this.props.currentDoc === null ? <div style={{ height: '500px' }}>
            <div class="loader-wrapper">
                <span class="circle circle-1"></span>
                <span class="circle circle-2"></span>
                <span class="circle circle-3"></span>
                <span class="circle circle-4"></span>
                <span class="circle circle-5"></span>
                <span class="circle circle-6"></span>
            </div>
        </div> : null)

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

        return (
            <div className='collab-page' onMouseMove={this.mouseMove}>

                {/* HEADER */}
                <div className='header'>
                    <a className='cosign-header-text' href="/">Cosign</a>
                    <div className='tools'>
                        <Signature setURL={this.setSignatureURL} />
                        <button onClick={this.toggleSelect}>Selectt</button>
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
                        <p className="page-number">{Math.floor(this.props.currentZoom * 100)}%</p>
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
                    {this.props.currentDoc !== null && this.props.userSocket !== null 
                        ?
                    <LoadDoc/>
                        : 
                    downloadLoader}

                    {/* Object Label */}
                    {
                        this.state.currentObjectOwner 
                            ? 
                        <div className='current-object-owner'>
                            {this.state.currentObjectOwner}
                        </div> 
                            : 
                        null
                    }
                </div>



                {/* FOOTER */}
                <div className='footer'>
                    <div className='footer-button-container'>
                        {
                            this.props.userSocket ?
                            <PilotMode/>
                            : null
                        }
                        <UsersList/>
                    </div>
                    <div className='tools'>
                        {/*  */}
                    </div>
                    <div className='footer-button-container'>
                        <DownloadDoc/>
                    </div>
                </div>

                {
                    this.props.userSocket ?
                    <div>
                        <PMWaitWindow/>
                        <PMConfirmWindow/>
                    </div>
                    : null
                }

                {holding && <img src={signatureURL} alt='signature-placeholder' id="signature-placeholder"></img>}
                <div onScroll={this.getScrollPercent}></div>
                
                <Alert variant='danger' show={this.state.disconnected}>
                    You are currently disconnected. The changes you make might not be saved.
                </Alert>

                <Tour
                    steps={steps}
                    isOpen={this.state.isTourOpen}
                    onRequestClose={this.closeTour} />
            </div>
        )
    }
}

CollabPage.propTypes = {
    // func
    setUserSocket: PropTypes.func.isRequired,
    setCurrentDoc: PropTypes.func.isRequired,
    setCurrentZoom: PropTypes.func.isRequired,
    setRoomCode: PropTypes.func.isRequired,
    setRenderFabricCanvasFunc: PropTypes.func.isRequired,
    setCanvasContainerRef: PropTypes.func.isRequired,
    updateCurrentUsers: PropTypes.func.isRequired,

    // var
    userSocket: PropTypes.object.isRequired,
    currentDoc: PropTypes.object.isRequired,
    numPages: PropTypes.number.isRequired,
    pageDimensions: PropTypes.array.isRequired,
    currentZoom: PropTypes.number.isRequired
}

const mapStateToProps = state => ({
    // room
    userSocket: state.room.userSocket,
    roomCode: state.room.roomCode,

    // doc
    currentDoc: state.doc.currentDoc,
    canvasContainerRef: state.doc.canvasContainerRef,
    numPages: state.doc.numPages,
    pageDimensions: state.doc.pageDimensions,

    // tools
    currentZoom: state.tool.currentZoom
})


export default connect(mapStateToProps, { 
    setUserSocket, 
    setRoomCode, 
    setCanvasContainerRef,
    setRenderFabricCanvasFunc,
    setCurrentDoc,
    setCurrentZoom,
    updateCurrentUsers
})(CollabPage)