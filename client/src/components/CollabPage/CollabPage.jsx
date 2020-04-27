import React from "react";

// Components
import { fabric } from 'fabric';
import Signature from '../Signature/Signature';
import CopyRoomCode from '../CopyRoomCode/CopyRoomCode';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import ListGroup from 'react-bootstrap/Button';

// Packages
import io from "socket.io-client";
import queryString from 'query-string';
import { Redirect } from 'react-router-dom';
import { nanoid } from 'nanoid';
import JSPDF from 'jspdf';
import { InView } from 'react-intersection-observer'

//CSS
import './CollabPage.css';

class CollabPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            socket: null,
            disconnected: false,
            endpoint: 'http://localhost:5000',
            username: null,
            roomKey: null,
            currentUsers: [],

            canvas: null,
            holding: false,
            toSend: false,
            pageX: 0,
            pageY: 0,
            originalHeight: [],
            originalWidth: [],
            currentZoom: 1,

            invalidRoomCodeProc: false,

            // when new user connects & other users disconnects
            newUser: '',
            usersJoinedAlertVisible: false,
            disconnectedUser: '',
            usersDisconnectedAlertVisible: false,
        }

        // when new user connects & other users disconnects
        this.usersJoinedAlertTimeout = null;
        this.usersDisconnectedAlertTimeout = null;
        
        this.createCanvases = this.createCanvases.bind(this);
        this.sendCanvases = this.sendCanvases.bind(this);
        this.getCanvases = this.getCanvases.bind(this);
        this.renderPage = this.renderPage.bind(this);
        this.setURL = this.setURL.bind(this);
        this.addImage = this.addImage.bind(this);
        this.delObject = this.delObject.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.setSocket = this.setSocket.bind(this);
        this.sendEdit = this.sendEdit.bind(this);
        this.sendDelete = this.sendDelete.bind(this);
        this.receiveEdit = this.receiveEdit.bind(this);
        this.receiveDelete = this.receiveDelete.bind(this);
        this.zoomIn = this.zoomIn.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
        this.handleQuery = this.handleQuery.bind(this);
        this.handleInView = this.handleInView.bind(this);
        this.invalidRoomCodeProc = this.invalidRoomCodeProc.bind(this);
        this.downloadPDF = this.downloadPDF.bind(this);
        this.scrollToPage = this.scrollToPage.bind(this);
        this.downloadProc = this.downloadProc.bind(this);
        this.usersJoined = this.usersJoined.bind(this);
        this.usersJoinedAlertProc = this.usersJoinedAlertProc.bind(this);
        this.userDisconnected = this.userDisconnected.bind(this);
        this.usersDisconnectedAlertProc = this.usersDisconnectedAlertProc.bind(this);
    }

    setSocket() {
        const socket = io(this.state.endpoint); 
        // const username = queryString.parse(this.props.location.search).username
        // const roomKey = queryString.parse(this.props.location.search).roomKey
        const username = this.state.username;
        const roomKey = this.state.roomKey;

        // if imgDatas is null, the person is joining the room not creating
        // find out if the given room code is valid or not
        // if (this.props.location.state.imgDatas === null) {
        //     socket.emit('checkRoomCode', {roomKey})
        // }
        const joining = this.props.location.state === undefined

        socket.on('join', () => socket.emit('join', { username, roomKey, joining}));    
        
        // when a user enters the room, call usersJoined function
        socket.on("userJoined", (currUsers, newUser) => this.usersJoined(currUsers, newUser));

        // when a user leaves the room, call userDisconnected function
        socket.on("userDisconnected", (currUsers, disconnectedUser) => this.userDisconnected(currUsers, disconnectedUser))

        socket.on("canvasSetup", canvasData => this.getCanvases(canvasData));
        socket.on("invalidRoomCode", () => this.invalidRoomCodeProc())

        // Send out the data 
        socket.on("editOut", canvasData => this.receiveEdit(canvasData));
        socket.on("deleteOut", canvasData => this.receiveDelete(canvasData));

        // first user to enter the room
        // so the server needs the canvas data to store in database
        socket.on("needCanvas", () => { this.createCanvases(); });
        socket.on('sendPage', pageData => this.renderPage(pageData))

        //on user disconnect
        socket.on('disconnect', () => {this.setState({disconnected: true});});
        socket.on('reconnect', () => {this.setState({disconnected: false});});

        socket.on('sendCanvasData', downloadData => {this.downloadPDF(downloadData)});

        this.setState({socket: socket});
    }

    invalidRoomCodeProc() {
        this.setState({
            invalidRoomCodeGiven: true
        })
    }

    // when a user enters the room, update the list of currently entered users
    // then proc an alert
    usersJoined(currUsers, newUser) {
        this.setState({
            currentUsers: currUsers,
            newUser: newUser
        }, () => {
            this.usersJoinedAlertProc();
        });
    }

    // alert that new user entered the room
    usersJoinedAlertProc() {
        clearTimeout(this.usersJoinedAlertTimeout)

        this.setState({
            usersJoinedAlertVisible: true
        }, () => {
            this.usersJoinedAlertTimeout = window.setTimeout(() => {
            this.setState({
                usersJoinedAlertVisible: false,
                newUser: ''
            })
        }, 5000)})
    }

    // when a user leaves the room, update the list of currently entered users
    // then proc an alert
    userDisconnected(currUsers, disconnectedUser) {
        this.setState({
            currentUsers: currUsers,
            disconnectedUser: disconnectedUser
        }, () => {
            this.usersDisconnectedAlertProc();
        });
    }

    // alert that a user was disconnected from the room
    usersDisconnectedAlertProc() {
        clearTimeout(this.usersDisconnectedAlertTimeout) 

        this.setState({
            usersDisconnectedAlertVisible: true
        }, () => {
            this.usersDisconnectedAlertTimeout = window.setTimeout(() => {
            this.setState({
                usersDisconnectedAlertVisible: false,
                disconnectedUser: ''
            })
        }, 5000)})
        
    }

    // creates the FIRST instace of canvases
    // receives data from PDFSelectPage.jsx in props
    createCanvases() {
        if (typeof this.props.location.state.imgDatas !== 'undefined') {
            let fabricCanvases = [];
            let self = this;
            for (let i = 0; i < this.props.location.state.imgDatas.length; i++) {

                let canvas = new fabric.StaticCanvas(null, { width: this.props.location.state.pageWidth, height: this.props.location.state.pageHeight });
                let currentPage = this.props.location.state.imgDatas[i];

                fabric.Image.fromURL(currentPage, function(img) {
                    img.resizeFilter = new fabric.Image.filters.Resize({
                    resizeType: 'sliceHack'
                    });
                    img.applyResizeFilters();;
                    canvas.setBackgroundImage(img, function() {
                        canvas.renderAll.bind(canvas);
                        fabricCanvases.push(canvas);
                        if (i === self.props.location.state.imgDatas.length - 1) {
                            self.sendCanvases();
                        }
                    });
                });
            }

            this.setState({
                canvas:fabricCanvases,
                currentUsers: [this.state.username]
            });

        } else {

            this.setState({invalidRoomCodeGiven: true});
        }
    }

    sendCanvases() {
        let canvas = [];
        let self = this;
        for (let i = 0; i < this.state.canvas.length; i++) {
            canvas.push(this.state.canvas[i].toJSON(['id']));
        }

        let roomKey = this.state.roomKey;
        let currentCanvas = {
            canvas: canvas,
            lowerCanvasDataURLs: this.props.location.state.imgDatas,
            pageCount: this.props.location.state.imgDatas.length,
            pageHeight: this.props.location.state.pageHeight,
            pageWidth: this.props.location.state.pageWidth
        }

        console.log(this.props.history);
        this.state.socket.emit('initCanvas', {roomKey, currentCanvas}, function(){
            self.props.history.replace({ search: self.props.history.location.search, state: {} });
        });
    }
    
    
    getCanvases(canvasData) {
        let fabricCanvases = [];
        this.setState({
            currentUsers: canvasData.users,
            canvasData: canvasData,
            originalHeight: [],
            originalWidth: []
        });

        for (let i = 0; i < canvasData.pageCount; i++) {
            fabricCanvases.push(i);
        }
        this.setState({canvas: fabricCanvases});
    }

    renderPage(pageData) {
        let self = this;
        let id = pageData.id;
        let element = document.getElementById(`wrapper-${id}`);
        let browserElement = document.getElementById(`browser-${id}`);
        let newCanvas = document.createElement('canvas');
        newCanvas.id = id.toString();
        newCanvas.width = pageData.canvas.backgroundImage.width;
        newCanvas.height = pageData.canvas.backgroundImage.height;
        element.appendChild(newCanvas);
        let canvas = new fabric.Canvas(id.toString());
        canvas.loadFromJSON(pageData.canvas, () => {
            element.style.minHeight = canvas.getHeight();
            element.style.width = canvas.getHeight();
            canvas.renderAll.bind(canvas);
            browserElement.style.backgroundImage = `url(${canvas.toDataURL({format: 'png'})})`;
        });

        let heightList = this.state.originalHeight;
        let widthList = this.state.originalWidth;
        heightList.push(canvas.getHeight());
        widthList.push(canvas.getWidth());

        this.setState({originalHeight: heightList,
                        originalWidth: widthList});

        canvas.on('mouse:up', function(e) {
            if (e.e.target.previousElementSibling !== null) {
                let currentCanvas = self.state.canvas[parseInt(e.e.target.previousElementSibling.id)]
                if (self.state.holding){
                    self.addImage(currentCanvas, self.state.url, e.pointer.x, e.pointer.y);
                    self.setState({holding: false});
                    self.setState({toSend: true});
                    //self.sendEdit(e.e.target.previousElementSibling.id);
                }
            }
        });

        canvas.on('object:added', function(e) {
            if (self.state.toSend) {
                self.sendEdit(e.target.canvas.lowerCanvasEl.id, e.target.id, 'add');
                self.setState({toSend:false});
            }
            
        });

        canvas.on('object:modified', function(e) {
            self.sendEdit(e.target.canvas.lowerCanvasEl.id, e.target.id, 'modify');
            
        });

        canvas.on('object:moving', function (e) {
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

        canvas.on('object:removed', function(e) {
            if (self.state.toSend) {
                self.sendDelete(e.target.canvas.lowerCanvasEl.id, e.target.id, 'remove');
                self.setState({toSend:false});
            }
            
        });

        canvas.on('selection:created', function(e) {
            for (let i = 0; i < self.state.canvas.length; i++) {
                if (typeof self.state.canvas[i] !== 'object' || i === parseInt(e.target.canvas.lowerCanvasEl.id)) {
                    continue;
                }
                self.state.canvas[i].discardActiveObject().renderAll();

            }
        });

        const newCanvasArr = [
            ...this.state.canvas.slice(0, id),
            canvas,
            ...this.state.canvas.slice(id + 1)
        ]

        this.setState({canvas: newCanvasArr});
        
    }

    setURL(url, e){
        if (url !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=') {
            this.setState({url});
            this.setState({holding: true,
                        pageX: e.pageX,
                        pageY: e.pageY});
        }
    }

    // adding the signature onto the canvas
    addImage(canvas, url, x, y){
        let self = this;
        fabric.Image.fromURL(url, function(signature) {
            var img = signature.set({ id: nanoid(), left: (x - signature.width / 2) / self.state.currentZoom, top: (y - signature.height / 2) / self.state.currentZoom});
            canvas.add(img);
        });
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

    sendEdit(id, objectId, action) {
        let roomKey = this.state.roomKey;
        let canvasObject;
        this.state.canvas[id].getObjects().forEach(function(o) {
            if(o.id === objectId) {
                canvasObject = o;
            }
        })

        let canvasData = {
            canvasJson: this.state.canvas[id].toJSON(['id']),
            canvasDataURL: this.state.canvas[id].toDataURL('img/png', 1.0),
            json: JSON.parse(JSON.stringify(canvasObject.toObject(['id']))),
            id: id,
            action: action
        }

        this.state.socket.emit('editIn', {roomKey, canvasData});
    }

    sendDelete(id, objectId, action) {
        let roomKey = this.state.roomKey;
        let canvasObject;

        this.state.canvas[id].getObjects().forEach(function(o) {
            if(o.id === objectId) {
                canvasObject = o;
            }
        })

        let canvasData = {
            canvasJson: this.state.canvas[id].toJSON(['id']),
            canvasDataURL: this.state.canvas[id].toDataURL('img/png', 1.0),
            objectId: objectId,
            id: id,
            action: action
        }

        this.state.socket.emit('deleteIn', {roomKey, canvasData});
    }

    receiveEdit(canvasData) {
        
        let self = this;
        if (typeof this.state.canvas[canvasData.id] === 'object') {
            fabric.util.enlivenObjects([canvasData.json], function(objects) {
                var origRenderOnAddRemove = self.state.canvas[canvasData.id].renderOnAddRemove;
                self.state.canvas[canvasData.id].renderOnAddRemove = false;
            
                objects.forEach(function(o) {
                    if (canvasData.action === 'add') {
                        self.state.canvas[canvasData.id].add(o);
                    } else if (canvasData.action === 'modify') {
                        self.state.canvas[canvasData.id].getObjects().forEach(function(co) {
                            if(o.id === co.id) {
                                self.state.canvas[canvasData.id].remove(co);
                                self.state.canvas[canvasData.id].add(o);
                            }
                        })
                    }
                });
            
                self.state.canvas[canvasData.id].renderOnAddRemove = origRenderOnAddRemove;
                self.state.canvas[canvasData.id].renderAll();
            });
        }
    }

    receiveDelete(canvasData) {
        let self = this;
        if (typeof this.state.canvas[canvasData.id] === 'object') {
            this.state.canvas[canvasData.id].getObjects().forEach(function(co) {
                if(co.id === canvasData.objectId) {
                    self.state.canvas[canvasData.id].remove(co);
                }
            })

        this.state.canvas[canvasData.id].discardActiveObject().renderAll();
        }
    }

    zoomIn() {
        if (this.state.canvas !== null) {
            for (let i = 0; i < this.state.canvas.length; i++) {
                let zoom = this.state.currentZoom + this.state.currentZoom * 0.1;
                this.setState({currentZoom: zoom});
                this.state.canvas[i].setZoom(zoom);
                this.state.canvas[i].setWidth(this.state.originalWidth[i] * this.state.canvas[i].getZoom());
                this.state.canvas[i].setHeight(this.state.originalHeight[i] * this.state.canvas[i].getZoom());
            }
        }
    }

    zoomOut() {
        if (this.state.canvas !== null) {
            for (let i = 0; i < this.state.canvas.length; i++) {
                let zoom = this.state.currentZoom - this.state.currentZoom * 0.1;
                this.setState({currentZoom: zoom});
                this.state.canvas[i].setZoom(zoom);
                this.state.canvas[i].setWidth(this.state.originalWidth[i] * this.state.canvas[i].getZoom());
                this.state.canvas[i].setHeight(this.state.originalHeight[i] * this.state.canvas[i].getZoom());
            }
        }
    }


    mouseMove(e) {
        if(this.state.holding) {
            let image = document.getElementById('signature-placeholder')
            image.style.top = e.pageY + 'px';
            image.style.left = e.pageX + 'px';
        }
    }  

    handleQuery() {
        // query: ?username=username&roomKey=roomKey
        const username = '' + queryString.parse(this.props.location.search).username
        const roomKey = '' + queryString.parse(this.props.location.search).roomKey
        this.setState({username, roomKey}, () => { 
            this.setSocket(); 
        })
    }

    downloadProc(event) {
        event.preventDefault();
        this.state.socket.emit('requestCanvasData')
    }
    
    downloadPDF(downloadData) {
        const canvasWidth = downloadData.pageWidth
        const canvasHeight = downloadData.pageHeight
        const jsPDF = new JSPDF({
            orientation: 'p',
            unit: 'px', 
            format: [canvasWidth, canvasHeight],
            compress: true
        });
        var PDFpageWidth = jsPDF.internal.pageSize.getWidth();
        var PDFpageHeight = jsPDF.internal.pageSize.getHeight();
        for (let i = 0; i < downloadData.pageCount; i++) {
            const canvas = downloadData.lowerCanvasDataURLs[i];
            if (i > 0) {
                jsPDF.addPage();
            }
            jsPDF.addImage(canvas, 'PNG', 0, 0, PDFpageWidth, PDFpageHeight);
        }
        jsPDF.save('download.pdf');
    }
    
    componentDidMount(){
        this.handleQuery();

        document.addEventListener("keydown", this.delObject, false);
        // this.setSocket();
    }

    handleInView(inView, entry) {
        let self = this;
        entry.target.dataset.visible = inView;
        if (inView && !entry.target.firstChild) {
            setTimeout(function(){ 
                if (entry.target.dataset.visible === 'true') {
                    self.state.socket.emit('requestPage', parseInt(entry.target.id.split('-')[1]));
                }
            }, 1000);
        }
    }

    scrollToPage(e) {
        let element = document.getElementById(`wrapper-${e.target.id.split('-')[1]}`);
        element.scrollIntoView();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.holding === false && this.state.holding === true) {
            let image = document.getElementById('signature-placeholder')
            image.style.top = this.state.pageY + 'px';
            image.style.left = this.state.pageX + 'px';
        }
    }

    componentWillUnmount(){
        document.removeEventListener("keydown", this.delObject, false);
    }

    render() {

        if (this.state.invalidRoomCodeGiven) {
            return <Redirect to={{pathname: '/invalid-room-code'}}></Redirect>
        }

        const {canvas} = this.state;
        const {url} = this.state;
        const {holding} = this.state;

        let roomCodeCopy;
        if (this.state.roomKey !== null) {
            roomCodeCopy = <CopyRoomCode roomCode={this.state.roomKey}></CopyRoomCode>
        }

        var pageBrowser = <p></p>
        if (this.state.canvas !== null) {
            pageBrowser = this.state.canvas.map((canvas, index) =>
                                <div className='browser-page-and-number-container'>
                                    <div id={`browser-${index}`} style={{'minHeight': 280, 'width': 200, 'backgroundColor': 'white', 'backgroundSize':'cover'}} onClick={this.scrollToPage}>
                                    </div>
                                    <p className='browser-page-number'>{index + 1}</p>
                                </div>
                            )
        }

        var inViewElement = <p></p>
        if (this.state.canvas !== null) {
            inViewElement = this.state.canvas.map((canvas, index) =>
                            <div className='page-and-number-container' 
                                style={{"minHeight": (typeof this.state.canvas[index] !== 'object' ? 842 : this.state.canvas[index].getHeight()), "width": (typeof this.state.canvas[index] !== 'object' ? 595 : this.state.canvas[index].getWidth())}}>
                                <InView 
                                    className='page-wrapper' 
                                    style={{"minHeight": (typeof this.state.canvas[index] !== 'object' ? 842 : this.state.canvas[index].getHeight()), "width": (typeof this.state.canvas[index] !== 'object' ? 595 : this.state.canvas[index].getWidth())}} as="div" id={`wrapper-${index}`} 
                                    onChange={(inView, entry) => this.handleInView(inView, entry)} >
                                </InView>
                                <p className='page-number'>{index + 1}</p>
                            </div>
                            )
        }
        
        return (
            <div className='collab-page' onMouseMove={this.mouseMove}>
                <div className='header'>
                    <a className='cosign-header-text' href="/">Cosign</a>
                    <div className='tools'>
                        <Signature
                            setURL={this.setURL}
                            canvas={canvas}
                            url={url}
                        />
                        
                    </div>
                    {roomCodeCopy}
                </div>
                <div className='body-container'>
                    <div id='browser-canvas-container'>
                        {pageBrowser}
                    </div>
                    <div id='canvas-container'>
                        {inViewElement}
                    </div>
                </div>
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
                        <Alert variant='success' show={this.state.usersJoinedAlertVisible}>
                            {this.state.newUser} has entered the room.
                        </Alert>
                        <Alert variant='warning ' show={this.state.usersDisconnectedAlertVisible}>
                            {this.state.disconnectedUser} has left the room.
                        </Alert>
                    </div>
                    <div className='download-button-container'>
                        <Button className='download-button' onClick={event => this.downloadProc(event)}>
                            Download
                        </Button>
                    </div>
                </div>
                {holding && <img src={url} alt='signature-placeholder' id="signature-placeholder"></img>}
                <Alert variant='danger' show={this.state.disconnected}>
                    You are currently disconnected. The changes you make might not be saved. 
                </Alert>
            </div>
        );
    }
}

export default CollabPage;