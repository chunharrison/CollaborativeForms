import React from 'react';

// Components
import Signature from '../Signature/Signature';
import CopyRoomCode from './CopyRoomCode/CopyRoomCode';
import LoadDoc from './LoadDoc/LoadDoc'
import DownloadDoc from './DownloadDoc/DownloadDoc';
import PilotMode from './PilotMode/PilotMode'
import PMWaitWindow from './PilotMode/PMWaitWindow'
import PMConfirmWindow from './PilotMode/PMConfirmWindow'
import TogglePanel from '../TogglePanel/TogglePanel';
import ToggleSelect from '../ToggleSelect/ToggleSelect';
import TogglePan from '../TogglePan/TogglePan';
import ZoomIn from '../ZoomIn/ZoomIn';
import ZoomOut from '../ZoomOut/ZoomOut';
import ToggleShape from '../ToggleShape/ToggleShape';
import ToggleDraw from '../ToggleDraw/ToggleDraw';
import ToggleText from '../ToggleText/ToggleText';
import InviteUser from './InviteUser/InviteUser'
import InviteUserPopup from './InviteUser/InviteUserPopup'
import UsersList from './UsersList/UsersList'
// react-bootstrap
import Alert from 'react-bootstrap/Alert';

// Libraries
import { Redirect } from 'react-router-dom'; // open source
import { fabric } from 'fabric';
import { nanoid } from 'nanoid';
import io from "socket.io-client";
import queryString from 'query-string';
import axios from 'axios';
// import Tour from 'reactour'; 
import Select from 'react-select';

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
    updateCurrentGuests,
    setHostName
} from '../../actions/roomActions'
import { setCurrentZoom,
    setToolMode,
    setPrevToolMode,
    setShape,
    setPanelToggle,
} from '../../actions/toolActions'

//images
import usersImg from './users.png';
import settingsImg from './settings.png'

//CSS
import './CollabPage.css';
import { toHexStringOfMinLength } from 'pdf-lib';

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

            //Shapes, drawing, highlighting and cursor modes
            origX: 0,
            origY: 0,
            drawTrueCanvasId: [],
            lastCanvas: 1,

            // Server
            endpoint: `${process.env.REACT_APP_BACKEND_ADDRESS}`,
            disconnected: false,
            invalidRoomCodeGiven: false,
        }

        // Browser Functionality
        this.scrollToPage = this.scrollToPage.bind(this);

        // Zoom
        this.setZoom = this.setZoom.bind(this);
        // Signature
        this.mouseMove = this.mouseMove.bind(this);
        this.setSignatureURL = this.setSignatureURL.bind(this);
        this.addImage = this.addImage.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        // Backend
        this.setSocket = this.setSocket.bind(this);
        this.invalidRoomCodeProc = this.invalidRoomCodeProc.bind(this);

        // Component Variables
        this.inViewElements = [];
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

    getGuests() {
        const options = {
          params: {
              roomCode: this.state.roomCode
          },
          headers: {
              'Access-Control-Allow-Credentials': true,
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET',
              'Access-Control-Allow-Headers': '*',
          },
        };
  
        axios.get('/api/guests/get-guests', options).then(res => {
          return res.guests
        })
      }

    addGuest() {
        console.log(this.state.roomCode, this.state.username, this.state.guestID)
        const options = {
            params: {
                roomCode: this.state.roomCode,
                guestName: this.state.username,
                guestID: this.state.guestID
            },
            headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': '*',
            },
        }

        axios.post('/api/guests/add-guest', options).then(res => {
            // return res.users
        })
        
    };

    getHostID() {
        const options = {
            params: {
                roomCode: this.state.roomCode
            },
            headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': '*',
            },
        }

        axios.get('/api/room/get-host-id', options).then(res => {
            return res.hostID
        })
    }

    setStateHostName() {
        const options = {
            params: {
                roomCode: this.state.roomCode
            },
            headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': '*',
            },
        }

        axios.get('/api/room/get-host-name', options).then(res => {
            // console.log(res.data.hostName)
            // this.setState({
            //     hostName: res.data.hostName
            // }, () => {
            //     this.props.setHostName(res.data.hostName)
            // })
        })
    }

    renderFabricCanvas = (pageNum, width, height) => {
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
            self.setState({drawTrueCanvasId: [...self.state.drawTrueCanvasId, fabricCanvas.lowerCanvasEl.id], lastCanvas: o.e.target.previousElementSibling.id})
            if (o.target && self.props.toolMode !== 'select') {
                o.target.hoverCursor = fabricCanvas.defaultCursor;
            }else if (self.props.toolMode === 'draw') {
                fabricCanvas.isDrawingMode = true;
                fabricCanvas.freeDrawingCursor = 'default';
                fabricCanvas.freeDrawingBrush.width = parseInt(self.props.drawBrushSize);
                let match = self.props.drawColor.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
                fabricCanvas.freeDrawingBrush.color = `rgb(${match[1]}, ${match[2]}, ${match[3]}, ${self.props.drawOpacity / 100})`;
            } else if (o.target) {
                o.target.hoverCursor = fabricCanvas.hoverCursor;
            }

        });

        //triggered when mousing out of canvas or object

        //triggers when mouse is clicked down
        fabricCanvas.on('mouse:down', function (o) {
            var pointer = fabricCanvas.getPointer(o.e);
            //add rectangle if highlither tool is used
            if (self.props.toolMode === 'shape') {
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
                        opacity: self.props.shapeOpacity / 100,
                        fill: self.props.shapeFillColor,
                        stroke: self.props.shapeBorderColor,
                        strokeWidth: parseInt(self.props.shapeBorderThickness),
                        transparentCorners: false
                    });
                    let obj={owner: self.state.username};
                    rect.set('owner',obj);
                    self.props.setShape(rect);
                    self.setState({
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
            //resize rectangle if shape is selected
            if (self.props.toolMode === 'shape') {
                if (self.state.origX > pointer.x) {
                    self.props.shape.set({ left: Math.abs(pointer.x) });
                }
                if (self.state.origY > pointer.y) {
                    self.props.shape.set({ top: Math.abs(pointer.y) });
                }

                self.props.shape.set({ width: Math.abs(self.state.origX - pointer.x) });
                self.props.shape.set({ height: Math.abs(self.state.origY - pointer.y) });
            }

            fabricCanvas.renderAll();
        });

        //triggers when left mouse button is released
        fabricCanvas.on('mouse:up', function (e) {
            var pointer = fabricCanvas.getPointer(e.e);
            self.setState({ isDown: false });

            if (self.props.toolMode === 'shape') {
                self.props.shape.setCoords();
                const modifiedSignatureObject = self.props.shape;
                const modifiedSignatureObjectJSON = JSON.parse(JSON.stringify(modifiedSignatureObject.toObject(['id', 'owner'])))

                let pageData = {
                    pageNum: pageNum,
                    modifiedSignatureObjectJSON: modifiedSignatureObjectJSON
                }

                self.props.userSocket.emit('editIn', pageData)
            } else if (self.props.toolMode === 'text') {
                self.setState({ toSend: true }, () => {
                    fabricCanvas.add(new fabric.IText('Insert Text', {
                        fontFamily: 'roboto',
                        fontSize: self.props.textFontSize,
                        fill: self.props.textColor,
                        opacity: self.props.textOpacity / 100,
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
            if (self.props.toolMode !== 'select') {
                fabricCanvas.discardActiveObject().renderAll();
            } else {
                self.setState({currentObjectOwner: e.target.get('owner').owner});
                if (self.state.username !== e.target.get('owner').owner) {
                    e.target.set({'borderColor':'#fbb802','cornerColor':'#fbb802'});
                }
            }


        });

        fabricCanvas.on('selection:updated', function (e) {
            if (self.props.toolMode !== 'select') {
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
    ######################################### Zoom ####################################
    ################################################################################################# */

    setZoom(e) {
        this.props.setCurrentZoom(e.value)
        for (let pageNum = 1; pageNum < this.props.numPages; pageNum++) {
            if (document.getElementById(pageNum.toString())) {
                let fabricElement = document.getElementById(pageNum.toString()).fabric
                fabricElement.setZoom(e.value)
                fabricElement.setWidth(this.props.pageDimensions[pageNum-1].width * e.value)
                fabricElement.setHeight(this.props.pageDimensions[pageNum-1].height * e.value)
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

    // handles key strokes
    handleKeyDown(e) {
        console.log(e);
        //delete objects
        if (e.keyCode === 46 && e.target.type !== 'textarea') {
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
            //trigger pan tool
        } else if(e.keyCode === 32 && e.target.type !== 'textarea'){
            e.preventDefault();

            if (this.props.toolMode !== 'pan') {
                this.props.setPrevToolMode(this.props.toolMode);
                this.props.setToolMode('pan');
            }
            //trigger select tool
        } else if(e.keyCode === 86 && e.target.type !== 'textarea'){
            e.preventDefault();

            if (this.props.toolMode !== 'select') {
                this.props.setPrevToolMode(this.props.toolMode);
                this.props.setToolMode('select');
            }
        } else if (e.keyCode === 66 && e.target.type !== 'textarea') {
            let fabricCanvas = document.getElementById(this.state.lastCanvas.toString()).fabric
            fabricCanvas.isDrawingMode = true;
            this.setState({drawTrueCanvasId: [...this.state.drawTrueCanvasId, fabricCanvas.lowerCanvasEl.id]});
            this.props.setPrevToolMode(this.props.toolMode);
            this.props.setToolMode('draw');
        } else if (e.keyCode === 85 && e.target.type !== 'textarea') {
            this.props.setPrevToolMode(this.props.toolMode);
            this.props.setToolMode('shape');
        } else if (e.keyCode === 84 && e.target.type !== 'textarea') {
            this.props.setPrevToolMode(this.props.toolMode);
            this.props.setToolMode('text');
        } else if (e.keyCode === 80 && e.target.type !== 'textarea') {
            this.props.setPanelToggle(!this.props.panelToggle);
        } else if (e.keyCode === 187 && e.target.type !== 'textarea') {
            this.props.setPanelToggle(!this.props.panelToggle);
        } else if (e.keyCode === 189 && e.target.type !== 'textarea') {
            this.props.setPanelToggle(!this.props.panelToggle);
        }
    }
    //deactivate pan tool when space is released
    handleKeyUp(e) {
        if(e.keyCode === 32 && this.props.toolMode === 'pan'){
            this.props.setToolMode(this.props.prevToolMode);
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
                    this.props.setCurrentDoc(blob) // redux
                    this.setState({ givenPDFDocument: blob })
                })
        });
    }

    setSocket(username, roomCode, action, guestID) {
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
            socket.emit('join', { socketID, username, roomCode, creation, guestID });

            this.setStateHostName()
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

        socket.on('updateCurrentGuests', (data) => {
            let guests = []
            guests.append(Object.values(data.currentGuests))
            this.props.updateCurrentGuests(guests)
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
        document.addEventListener("keydown", this.handleKeyDown, false);
        document.addEventListener("keyup", this.handleKeyUp, false);

        // parse the query parameters and set states accordingly
        // query: ?username=username&roomCode=roomCode
        // THEN setup Socket.io object
        const username = '' + queryString.parse(this.props.location.search).username
        const roomCode = '' + queryString.parse(this.props.location.search).roomCode
        const action = '' + queryString.parse(this.props.location.search).action
        const guestID = '' + queryString.parse(this.props.location.search).guestID
        this.props.setRoomCode(roomCode) 
        this.setState({ username, roomCode, action, guestID }, () => {
            this.setSocket(username, roomCode, action, guestID); // Socket.io
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

        if (prevProps.toolMode === 'draw' && this.props.toolMode !== 'draw') {
            this.state.drawTrueCanvasId.forEach(function (id) {
                let fabricCanvasObject = document.getElementById(id.toString()).fabric;
                fabricCanvasObject.isDrawingMode = false;
            })
        }
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown, false);
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
                    <div id={`browser-${index + 1}`} style={{ 'minHeight': 200, 'width': 150, 'backgroundColor': 'white', 'backgroundSize': 'cover' }} onClick={this.scrollToPage}>
                    </div>
                    <p className='browser-page-number'>{index + 1}</p>
                </div>
            )
        }

        let downloadLoader = (this.props.currentDoc === null ? <div style={{ height: '500px' }}>
            <div className="loader-wrapper">
                <span className="circle circle-1"></span>
                <span className="circle circle-2"></span>
                <span className="circle circle-3"></span>
                <span className="circle circle-4"></span>
                <span className="circle circle-5"></span>
                <span className="circle circle-6"></span>
            </div>
        </div> : null)

        const options = [
            { value: 0.25, label: '25%' },
            { value: 0.5, label: '50%' },
            { value: 0.75, label: '75%' },
            { value: 1, label: '100%' },
            { value: 1.25, label: '125%' },
            { value: 1.5, label: '150%' },
            { value: 1.75, label: '175%' },
            { value: 2, label: '200%' },
          ];

        const zoomValue = [
            {
                label: `${this.props.currentZoom * 100}%`,
                value: this.props.currentZoom,
            }
        ]


        return (
            <div className='collab-page' onMouseMove={this.mouseMove}>

                {/* HEADER */}
                <div className='header'>
                    <div className='header-tools-left'>
                        <TogglePanel/>
                        <ToggleSelect/>
                        <TogglePan/>
                        <ZoomOut/>
                        <ZoomIn/>
                        <Select
                        className='zoom-dropdown'
                        value={zoomValue}
                        options={options}
                        onChange={this.setZoom}
                        />
                        {
                            this.props.userSocket ?
                            <PilotMode/>
                            : null
                        }
                    </div>
                    <div className='header-tools-right'>
                        <InviteUser/>
                        {/* <div className='tool'>
                            <img src={usersImg}/>
                        </div> */}
                        <UsersList/>
                        <DownloadDoc/>
                        <div className='tool'>
                            <img src={settingsImg}/>
                        </div>
                    </div>
                </div>
                {/* /HEADER */}

                {/* BODY */}
                {/* don't render until we receive the document from the server */}
                <div className='body-container'>
                    <div className={`outer ${this.props.panelToggle ? 'panel-true' : 'panel-false'}`}>
                        <div id='browser-canvas-container'>
                            {pageBrowser}
                        </div>
                    </div>
                    {this.props.currentDoc !== null && this.props.userSocket !== null 
                        ?
                    <LoadDoc/>
                        : 
                    downloadLoader}
                    <div className='side-bar-container'>
                        <p className='cosign-float'>cosign</p>
                        <div className='side-bar-tools'>
                            <Signature setURL={this.setSignatureURL} />
                            <ToggleShape/>
                            <ToggleDraw/>
                            <ToggleText/>
                        </div>  
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
                <InviteUserPopup/>

                {holding && <img src={signatureURL} alt='signature-placeholder' id="signature-placeholder"></img>}
                <div onScroll={this.getScrollPercent}></div>
                
                <Alert variant='danger' show={this.state.disconnected}>
                    You are currently disconnected. The changes you make might not be saved.
                </Alert>
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
    updateCurrentGuests: PropTypes.func.isRequired,

    // var
    userSocket: PropTypes.object.isRequired,
    currentDoc: PropTypes.object.isRequired,
    numPages: PropTypes.number.isRequired,
    pageDimensions: PropTypes.array.isRequired,
    currentZoom: PropTypes.number.isRequired
}

const mapStateToProps = state => ({
    // auth
    auth: state.auth,

    // room
    userSocket: state.room.userSocket,
    roomCode: state.room.roomCode,

    // doc
    currentDoc: state.doc.currentDoc,
    canvasContainerRef: state.doc.canvasContainerRef,
    numPages: state.doc.numPages,
    pageDimensions: state.doc.pageDimensions,

    // tools
    currentZoom: state.tool.currentZoom,
    panelToggle: state.tool.panelToggle,
    toolMode: state.tool.toolMode,
    prevToolMode: state.tool.prevToolMode,
    shapeBorderColor: state.tool.shapeBorderColor,
    shapeBorderThickness: state.tool.shapeBorderThickness,
    shapeFillColor: state.tool.shapeFillColor,
    shapeOpacity: state.tool. shapeOpacity,
    shape: state.tool.shape,
    drawOpacity: state.tool.drawOpacity,
    drawBrushSize: state.tool.drawBrushSize,
    drawColor: state.tool.drawColor,
    textColor: state.tool.textColor,
    textOpacity: state.tool.textOpacity,
    textFontSize: state.tool.textFontSize,
    panelToggle: state.tool.panelToggle,
})


export default connect(mapStateToProps, { 
    setUserSocket, 
    setRoomCode, 
    setHostName,

    setCanvasContainerRef,
    setRenderFabricCanvasFunc,
    setCurrentDoc,
    setCurrentZoom,
    updateCurrentGuests,
    setToolMode,
    setPrevToolMode,
    setShape,
    setPanelToggle,
})(CollabPage)