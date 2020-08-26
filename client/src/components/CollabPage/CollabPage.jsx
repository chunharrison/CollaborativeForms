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
import ToggleHighlighter from '../ToggleHighlighter/ToggleHighlighter';
import InviteUser from './InviteUser/InviteUser'
import InviteUserPopup from './InviteUser/InviteUserPopup'
import UsersList from './UsersList/UsersList'
import CommentsPanel from '../CommentsPanel/CommentsPanel'
import PageBrowser from './PageBrowser/PageBrowser';
import RoomSettings from './RoomSettings/RoomSettings'
import RoomSettingsWindow from './RoomSettings/RoomSettingsWindow'
import ObjectHotbar from './ObjectHotbar/ObjectHotbar'

// react-bootstrap
import Alert from 'react-bootstrap/Alert';

// Libraries
import { Redirect } from 'react-router-dom'; // open source
import { fabric } from 'fabric';
import { nanoid } from 'nanoid';
import io from "socket.io-client";
import queryString from 'query-string';
import axios from 'axios';
import * as rb from "rangeblock";
import html2canvas from 'html2canvas';
// import Tour from 'reactour'; 
import Select from 'react-select';

// redux
// import PropTypes from 'prop-types'
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
    updateCurrentGuestObject,
    setHostName,
    setGuestID,
    setRoomHostID,

    getRoomCapacity,
    getDownloadOption,
    updateDownloadOption
} from '../../actions/roomActions'
import { setCurrentZoom,
    setToolMode,
    setPrevToolMode,
    setShape,
    setPanelToggle,
    addHighlight,
    addComment,
    addPageHighlight,
    addAllHighlight,
    setPanelMode,
    deleteHighlight,
    setHotbarObject
} from '../../actions/toolActions'

// images
import pagesImg from './pages.png';
import commentImg from './comment.png';
import accountImg from './account.png'

//CSS
import './CollabPage.css';
import { toHexStringOfMinLength } from 'pdf-lib';

class CollabPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            guestIdOccupied: false,
            roomFull: false,

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
            selectedArea: null,
            currentCanvas: null,

            // Server
            endpoint: `${process.env.REACT_APP_BACKEND_ADDRESS}`,
            disconnected: false,
            invalidRoomCodeGiven: false,
        }
        
        //highlighter
        this.handleSelection = this.handleSelection.bind(this);
        this.receiveHighlight = this.receiveHighlight.bind(this);
        this.receiveComment = this.receiveComment.bind(this);
        // Zoom
        this.setZoom = this.setZoom.bind(this);
        // Signature
        this.mouseMove = this.mouseMove.bind(this);
        this.setSignatureURL = this.setSignatureURL.bind(this);
        this.addImage = this.addImage.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.deleteObject = this.deleteObject.bind(this);

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

    setStateHostID() {
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

        axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/room/get-host-id`, options)
            .then(res => {
                this.setState({
                    hostID: res.data.hostID
                }, () => {
                    this.props.setRoomHostID(res.data.hostID)

                    // TODO: harrison
                    // had to do this because getting of hostID was sync
                    // find a better way to do this synchronously 

                    // GUESTS
                    if (this.state.guestID !== 'undefined' && this.props.auth.user.id !== this.state.hostID) {
                        const options = {
                            params: {
                                roomCode: this.state.roomCode,
                                // guestID: this.state.guestID
                            },
                            headers: {
                                'Access-Control-Allow-Credentials': true,
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': 'GET',
                                'Access-Control-Allow-Headers': '*',
                            },
                        };
                    
                        axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/guests/get-id-occupied`, options).then(res => {
                            // TODO: harrison
                            // fix when more than 1 person joins using the same guestid
                            // this.setState({guestIdOccupied: res.data.occupied})
                        })

                        axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/room/get-room-capacity-status`, options)
                            .then(res => {
                                this.setState({roomFull: res.data.roomFull})
                            })
            
                        this.props.setGuestID(this.state.guestID)
                    }

                    // SOCKET
                    this.setSocket(this.state.username, this.state.roomCode, this.state.guestID);
                })
            })
            .catch(err => {
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

        axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/room/get-host-name`, options).then(res => {
            this.setState({
                hostName: res.data.hostName
            }, () => {
                this.props.setHostName(res.data.hostName)
            })
        })
    }

    setStateGuestList() {
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

        axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/room/get-guest-list`, options).then(res => {

            let currentGuestList = [...Object.values(res.data.guestList)]
            this.setState({
                guestList: currentGuestList
            }, () => {
                this.props.updateCurrentGuests(currentGuestList)
                this.props.updateCurrentGuestObject(res.data.guestList)
            })
        })
    }

    renderFabricCanvas = (pageNum, width, height) => {
        let self = this;

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
            selection: false,
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

        this.props.userSocket.emit('getCurrentPageHighlights', pageNum, (currentPageHighlightList) => {
            this.props.addPageHighlight({key: pageNum, values: currentPageHighlightList})
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
            let objects = fabricCanvas.getObjects(); //return Array<objects>
            objects.forEach(object=>{
                //list the attributes for each object
                if (object.get('type') === 'i-text' && fabricCanvas.getActiveObjects().length === 0) {
                    object.exitEditing();
                }
            });
            if (self.props.toolMode === 'select') {
                self.setState({currentCanvas: fabricCanvas}, () => {
                    self.props.setHotbarObject(null);
                })
            }
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
            if (self.props.toolMode === 'select') {
                self.setState({currentCanvas: fabricCanvas}, () => {
                    self.props.setHotbarObject(e.target);
                })
            }

            var pointer = fabricCanvas.getPointer(e.e);
            self.setState({ isDown: false });

            if (self.props.toolMode === 'shape') {
                self.props.shape.setCoords();
                const modifiedSignatureObject = self.props.shape;
                const modifiedSignatureObjectJSON = JSON.parse(JSON.stringify(modifiedSignatureObject.toObject(['id', 'owner', 'originalX', 'originalY'])))

                let pageData = {
                    pageNum: pageNum,
                    modifiedSignatureObjectJSON: modifiedSignatureObjectJSON
                }

                self.props.userSocket.emit('editIn', pageData)
            } else if (self.props.toolMode === 'text') {
                self.setState({ toSend: true }, () => {
                    let newText = new fabric.IText('', {
                        fontFamily: 'Helvetica',
                        fontSize: self.props.textFontSize,
                        fill: self.props.textColor,
                        opacity: self.props.textOpacity / 100,
                        left: pointer.x,
                        top: pointer.y,
                        id: nanoid(),
                    })
                    fabricCanvas.add(newText);
                    fabricCanvas.setActiveObject(newText);
                    fabricCanvas.renderAll();
                    newText.enterEditing();
                    newText.hiddenTextarea.focus();

                })

                self.props.setToolMode('select');
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
            const newSignatureObject = e.target;
            newSignatureObject.lockUniScaling = true;
            if (!e.target.get('owner')) {
                let obj={owner: self.state.username};
                newSignatureObject.set('owner',obj);
                let originalX={originalX: newSignatureObject.left};
                newSignatureObject.set('originalX',originalX);
                let originalY={originalY: newSignatureObject.top};
                newSignatureObject.set('originalY',originalY);
            }
            const newSignatureObjectJSON = JSON.parse(JSON.stringify(newSignatureObject.toObject(['id', 'owner', 'originalX', 'originalY'])))
            let pageData = {
                pageNum: pageNum,
                newSignatureObjectJSON: newSignatureObjectJSON
            }
            if (self.state.toSend) {
                self.props.userSocket.emit('addIn', pageData)
                self.setState({ toSend: false });
            }
            fabricCanvas.renderAll();
        });

        fabricCanvas.on('object:modified', function (e) {
            const modifiedSignatureObject = e.target
            const modifiedSignatureObjectJSON = JSON.parse(JSON.stringify(modifiedSignatureObject.toObject(['id', 'owner', 'originalX', 'originalY'])))

            let pageData = {
                pageNum: pageNum,
                modifiedSignatureObjectJSON: modifiedSignatureObjectJSON
            }

            self.props.userSocket.emit('editIn', pageData);
            fabricCanvas.renderAll();
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
            const removedSignatureObjectJSON = JSON.parse(JSON.stringify(removedSignatureObject.toObject(['id', 'owner', 'originalX', 'originalY'])))

            let pageData = {
                pageNum: pageNum,
                removedSignatureObjectJSON: removedSignatureObjectJSON
            }

            if (self.state.toSend) {
                self.props.userSocket.emit("deleteIn", pageData)
                self.setState({ toSend: false });
            }

            fabricCanvas.renderAll();

        });

        fabricCanvas.on('text:changed', function (e) {
            const modifiedSignatureObject = e.target
            const modifiedSignatureObjectJSON = JSON.parse(JSON.stringify(modifiedSignatureObject.toObject(['id', 'owner', 'originalX', 'originalY'])))

            let pageData = {
                pageNum: pageNum,
                modifiedSignatureObjectJSON: modifiedSignatureObjectJSON
            }

            self.props.userSocket.emit('editIn', pageData)
        });

        fabricCanvas.on("path:created", function (o) {
            o.path.id = nanoid();
            const newSignatureObject = o.path
            const newSignatureObjectJSON = JSON.parse(JSON.stringify(newSignatureObject.toObject(['id', 'owner', 'originalX', 'originalY'])))
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
    ######################################### Highlighter ####################################
    ################################################################################################# */

    handleSelection(e) {
        let tempValue = rb.extractSelectedBlock(window, document);
        if (typeof tempValue !== 'undefined' && tempValue !== null && this.state.selectedArea !== tempValue && this.props.toolMode === 'highlighter') {
            this.setState({selectedArea: tempValue}, () => {
                if (typeof this.state.selectedArea.rangeCache.m_cac.classList !== 'undefined' && this.state.selectedArea.rangeCache.m_cac.classList.contains('react-pdf__Page__textContent')) {
                    let key = this.state.selectedArea.rangeCache.m_cac.parentNode.getAttribute('data-page-number');
                    let id = this.state.selectedArea.id;
                    let pageData = { highlight: [this.state.selectedArea.dimensions, this.state.selectedArea.text, ''], pageNum: key, id: id }
                    this.props.addHighlight({key: key, id: id, values: this.state.selectedArea.dimensions, text: this.state.selectedArea.text});
                    this.props.userSocket.emit('highlightIn', pageData);

                } else if (typeof this.state.selectedArea.rangeCache.m_cac.parentNode.parentNode.classList !== 'undefined' && this.state.selectedArea.rangeCache.m_cac.parentNode.parentNode.classList.contains('react-pdf__Page__textContent')) {
                    let key = this.state.selectedArea.rangeCache.m_cac.parentNode.parentNode.parentNode.getAttribute('data-page-number');
                    let id = this.state.selectedArea.id;
                    let pageData = { highlight: [this.state.selectedArea.dimensions, this.state.selectedArea.text, ''], pageNum: key, id: id }
                    this.props.addHighlight({key: key, id: id, values: this.state.selectedArea.dimensions, text: this.state.selectedArea.text}) 
                    this.props.userSocket.emit('highlightIn', pageData)
                }
            });
        }
    }

    receiveHighlight(pageData) {
            this.props.addHighlight({key: pageData.pageNum, id: pageData.id, values: pageData.values[pageData.id][0], text: pageData.text}) 
        
    }

    receiveComment(pageData) {
        this.props.addComment({key: pageData.pageNum, id: pageData.id, values: pageData.values, text: pageData.text, comment: pageData.comment}) 
    }

    /* #################################################################################################
    ######################################### Zoom ####################################
    ################################################################################################# */

    setZoom(e) {
        this.props.setCurrentZoom(e.value)
        for (let pageNum = 1; pageNum <= this.props.numPages; pageNum++) {
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
        this.props.setToolMode('select');
    }

    deleteObject(object) {
        if (this.state.currentCanvas !== null) {
            this.setState({ toSend: true }, () => {
                this.state.currentCanvas.remove(object);
            });
            this.props.setHotbarObject(null);

        }
    }

    // handles key strokes
    handleKeyDown(e) {
        //delete objects
        if (e.keyCode === 46 && e.target.type !== 'textarea') {
            this.setState({ holding: false });
            this.deleteObject(this.props.hotbarObject)
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
        } else if(e.keyCode === 72 && e.target.type !== 'textarea'){
            e.preventDefault();

            if (this.props.toolMode !== 'highlighter') {
                this.props.setPrevToolMode(this.props.toolMode);
                this.props.setToolMode('highlighter');
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

    getDocument(roomCode) {
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
                    this.props.setCurrentDoc(blob) // redux
                })
        });
    }

    setSocket(username, roomCode, guestID) {
        // Socket.io
        const socket = io(this.state.endpoint);
        this.props.setUserSocket(socket) // redux

        // when a user joins, send the server the username to be stored 
        // and the roomcode to update the correct database
        // the server then emits an initial setup with:
        //      the document file, existing signature object and the list of people in the room
        socket.on('join', () => {
            const isHost = this.props.auth.user.id === this.state.hostID
            socket.emit('join', { username, roomCode, guestID, isHost });
        });

        // Connection
        socket.on('disconnect', () => {
            this.setState({ disconnected: true });
        })

        socket.on('reconnect', () => {
            window.location.reload();
            this.setState({ disconnected: false });
        })

        socket.on('updateGuestList', (data) => {
            let guests = [...Object.values(data.currentGuests)]
            this.props.updateCurrentGuests(guests)
            this.props.updateCurrentGuestObject(data.currentGuests)
        })

        socket.on('updateDownloadOption', newDownloadOption => {
            this.props.updateDownloadOption(newDownloadOption)
        })

        socket.on("invalidRoomCode", () => this.invalidRoomCodeProc())

        // Signatures
        socket.on("addOut", (pageData) => this.receiveAdd(pageData));
        socket.on("editOut", (pageData) => this.receiveEdit(pageData));
        socket.on("deleteOut", (pageData) => this.receiveDelete(pageData));
        //highlights & comments
        socket.on('updateHighlights', (highlightDict) => this.props.addAllHighlight(highlightDict))
        socket.on("highlightOut", (pageData) => this.receiveHighlight(pageData));
        socket.on("commentOut", (pageData) => this.receiveComment(pageData));
        socket.on('commentDeleteOut', (pageData) => this.props.deleteHighlight({key: pageData.pageNum, id:pageData.id}));
        

        // set socket.io to state
        this.setState({ socket: socket });
        // this.setStateGuestList()
    }

    /* #################################################################################################
    ################################################################################################# */
    //Close intro popup
    closeTour() {
        this.setState({ isTourOpen: false });
    }

    test() {
        this.setState({
            testPageRendered: true
        })
    }

    onLogoClick(e) {
        e.preventDefault()
        
        this.props.history.push("/")
    }

    onAccountPortalClick(e) {
        e.preventDefault()
        
        this.props.history.push("/account-portal")
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
        let username = '' + queryString.parse(this.props.location.search).username
        let roomCode = '' + queryString.parse(this.props.location.search).roomCode
        let guestID = '' + queryString.parse(this.props.location.search).guestID

        // DEMO PAGE
        if (this.props.demoPage) {
            this.getDocument('demo')
        } else {
            this.getDocument(roomCode)
        }

        this.props.setRoomCode(roomCode) 
        // TODO: set roomCode in the CreateDocument.jsx & DocumentCard.jsx in redux
        this.setState({ username, roomCode, guestID, }, () => {
            // HOST
            this.setStateHostName()
            this.setStateHostID() 

            // OPTIONS
            this.props.getDownloadOption(roomCode)
            this.props.getRoomCapacity(roomCode)
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
        document.removeEventListener("keyup", this.handleKeyUp, false);

        if (this.props.userSocket) this.props.userSocket.close()
    }


    /* #################################################################################################
    ################################################################################################# */

    invalidRoomCodeProc() {
        this.setState({
            invalidRoomCodeGiven: true
        })
    }

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
            <div className="collab-page-container">
                {
                    // this.state.guestIdOccupied
                    this.state.roomFull 
                ?
                <div className="invalid-room-code">
                    <div className="error-code-div">
                        <h1 className="error-code">
                            404
                            <br/><br/><br/>
                        </h1>
                    </div>
                    <div className="warning-message-div">
                        <h1 className="warning-message">
                            Current Room Is Full
                        </h1>
                    </div>
                </div>
                :
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
                        <UsersList/>
                        <InviteUser isDemoPage={this.props.demoPage}/>
                        {/* <div className='tool'>
                            <img src={usersImg}/>
                        </div> */}
                        <DownloadDoc demoPageDownload={this.props.demoPage}/>
                        <RoomSettings />
                        <div className="tool" onClick={e => this.onAccountPortalClick(e)}><img src={accountImg}/></div>
                    </div>
                </div>
                {/* /HEADER */}

                {/* BODY */}
                {/* don't render until we receive the document from the server */}
                <div className='body-container' onMouseUp={this.handleSelection}>
                    <div className={`outer ${this.props.panelToggle ? 'panel-true' : 'panel-false'}`}>
                        <button className='panel-page-button' style={{'backgroundColor': `${this.props.panelMode === 'page' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`}} onClick={() => this.props.setPanelMode('page')}>
                            <img src={pagesImg} className='panel-image'/>
                        </button>
                        <button className='panel-comment-button' style={{'backgroundColor': `${this.props.panelMode === 'comment' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`}} onClick={() => this.props.setPanelMode('comment')}>
                            <img src={commentImg} className='panel-image'/>
                        </button>
                        <div id='browser-canvas-container'>
                            {this.props.panelMode === 'page' ? <PageBrowser/> : <CommentsPanel/>}
                        </div>
                    </div>
                    {this.props.currentDoc !== null && this.props.userSocket !== null 
                        ?
                    <LoadDoc/>
                        : 
                    downloadLoader}
                    <div className='side-bar-container'>
                        <p className='cosign-float' onClick={e => this.onLogoClick(e)}>cosign</p>
                        <div className='side-bar-tools'>
                            <Signature setURL={this.setSignatureURL} />
                            <ToggleShape/>
                            <ToggleDraw/>
                            <ToggleText/>
                            <ToggleHighlighter/>
                        </div>  
                    </div>
                    <ObjectHotbar
                    currentCanvas={this.state.currentCanvas}
                    deleteObject={this.deleteObject}
                    />
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
                <RoomSettingsWindow/>

                {holding && <img src={signatureURL} alt='signature-placeholder' id="signature-placeholder"></img>}
                <div onScroll={this.getScrollPercent}></div>
                
                <Alert variant='danger' show={this.state.disconnected}>
                    You are currently disconnected. The changes you make might not be saved.
                </Alert>
            </div>
    }
            </div>
        )
    }
}

// CollabPage.propTypes = {
//     // func
//     setUserSocket: PropTypes.func.isRequired,
//     setCurrentDoc: PropTypes.func.isRequired,
//     setCurrentZoom: PropTypes.func.isRequired,
//     setRoomCode: PropTypes.func.isRequired,
//     setRenderFabricCanvasFunc: PropTypes.func.isRequired,
//     setCanvasContainerRef: PropTypes.func.isRequired,
//     updateCurrentGuests: PropTypes.func.isRequired,

//     // var
//     currentDoc: PropTypes.object.isRequired,
//     numPages: PropTypes.number.isRequired,
//     pageDimensions: PropTypes.array.isRequired,
//     currentZoom: PropTypes.number.isRequired
// }

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
    panelMode: state.tool.panelMode,
    hotbarObject: state.tool.hotbarObject
})


export default connect(mapStateToProps, { 
    setUserSocket, 
    setRoomCode, 
    setHostName,
    setGuestID,
    setRoomHostID,

    // options
    getRoomCapacity,
    getDownloadOption,
    updateDownloadOption,

    setCanvasContainerRef,
    setRenderFabricCanvasFunc,
    setCurrentDoc,
    setCurrentZoom,
    updateCurrentGuests,
    updateCurrentGuestObject,
    setToolMode,
    setPrevToolMode,
    setShape,
    setPanelToggle,
    addHighlight,
    addComment,
    addPageHighlight,
    addAllHighlight,
    setPanelMode,
    deleteHighlight,
    setHotbarObject
})(CollabPage)