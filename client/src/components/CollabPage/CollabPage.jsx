import React from "react";

// Components
import { fabric } from 'fabric';
import Signature from '../Signature/Signature';
import InfoBar from '../InfoBar'

// Packages
import io from "socket.io-client";
import queryString from 'query-string';

class CollabPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            socket: null,
            endpoint: '127.0.0.1:5000',
            username: null,
            roomKey: null,

            canvas: null,
            holding: false,
            toSend: false,
            pageX: 0,
            pageY: 0
        }
        
        this.createCanvases = this.createCanvases.bind(this);
        this.sendCanvases = this.sendCanvases.bind(this);
        this.getCanvases = this.getCanvases.bind(this);
        this.setURL = this.setURL.bind(this);
        this.addImage = this.addImage.bind(this);
        this.delObject = this.delObject.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.setSocket = this.setSocket.bind(this);
        this.sendEdit = this.sendEdit.bind(this);
        this.receiveEdit = this.receiveEdit.bind(this);
        this.handleQuery = this.handleQuery.bind(this);
    }

    setSocket() {
        const socket = io(this.state.endpoint); 
        // const username = queryString.parse(this.props.location.search).username
        // const roomKey = queryString.parse(this.props.location.search).roomKey
        const name = this.state.username;
        const room = this.state.roomKey; 
        console.log(name, room)
        socket.emit('join', { name, room })        
        socket.on("canvasSetup", canvasData => this.getCanvases(canvasData));

        // Send out the data 
        socket.on("editOut", canvasData => this.receiveEdit(canvasData));

        // first user to enter the room
        // so the server needs the canvas data to store in database
        socket.on("needCanvas", () => { this.createCanvases(); });

        this.setState({socket: socket});
    }

    // creates the FIRST instace of canvases
    // receives data from PDFSelectPage.jsx in props
    createCanvases() {
        let fabricCanvases = [];
        let self = this;

        for (let i = 0; i < this.props.location.state.imgDatas.length; i++) {

            let canvas = new fabric.StaticCanvas(null, { width: this.props.location.state.pageWidth, height: this.props.location.state.pageHeight });
            let currentPage = this.props.location.state.imgDatas[i];

            canvas.on('mouse:up', function(e) {
                let currentCanvas = self.state.canvas[parseInt(e.e.target.previousElementSibling.id)]
                if (self.state.holding){
                    self.addImage(currentCanvas, self.state.url, e.pointer.x, e.pointer.y);
                    self.setState({holding: false});
                    self.setState({toSend: true});
                }
            });

            canvas.on('object:added', function(e) {
                if (self.state.toSend) {
                    self.sendEdit(e.target.canvas.lowerCanvasEl.id);
                    self.setState({toSend:false});
                    self.state.canvas[e.target.canvas.lowerCanvasEl.id].renderAll.bind(self.state.canvas[e.target.canvas.lowerCanvasEl.id]);
                }
            });

            canvas.on('selection:created', function(e) {
                console.log(e);
            });

            canvas.setBackgroundImage(currentPage, function() {
                canvas.renderAll.bind(canvas);
                fabricCanvases.push(canvas);
                if (i === self.props.location.state.imgDatas.length - 1) {
                    self.sendCanvases();
                }
            });
        }

        this.setState({canvas:fabricCanvases});
    }

    sendCanvases() {
        let canvas = [];
        for (let i = 0; i < this.state.canvas.length; i++) {
            canvas.push(this.state.canvas[i].toJSON());
        }

        let currentRoom = this.state.roomKey;
        let currentCanvas = {
            canvas: canvas,
            pageCount: this.props.location.state.imgDatas.length,
            pageHeight: this.props.location.state.pageHeight,
            pageWidth: this.props.location.state.pageWidth
        }

        this.state.socket.emit('initCanvas', {currentRoom, currentCanvas});
    }
    
    getCanvases(canvasData) {
        let container = document.getElementById("canvas-container");
        let fabricCanvases = [];
        let self = this;

        for (let i = 0; i < canvasData.pageCount; i++) {
            let newCanvas = document.createElement('canvas');
            newCanvas.id = i.toString();
            newCanvas.width = canvasData.pageWidth;
            newCanvas.height = canvasData.pageHeight;
            container.appendChild(newCanvas);
            let canvas = new fabric.Canvas(i.toString());
            canvas.loadFromJSON(canvasData.canvas[i], canvas.renderAll.bind(canvas));

            canvas.on('mouse:up', function(e) {
                let currentCanvas = self.state.canvas[parseInt(e.e.target.previousElementSibling.id)]
                if (self.state.holding){
                    self.addImage(currentCanvas, self.state.url, e.pointer.x, e.pointer.y);
                    self.setState({holding: false});
                    self.setState({toSend: true});
                    //self.sendEdit(e.e.target.previousElementSibling.id);
                }
            });

            canvas.on('object:added', function(e) {
                if (self.state.toSend) {
                    self.sendEdit(e.target.canvas.lowerCanvasEl.id);
                    self.setState({toSend:false});
                }
                
            });

            canvas.on('object:removed', function(e) {
                if (self.state.toSend) {
                    self.sendEdit(e.target.canvas.lowerCanvasEl.id);
                    self.setState({toSend:false});
                }
                
            });

            canvas.on('selection:created', function(e) {
                for (let i = 0; i < self.state.canvas.length; i++) {
                    if (i === parseInt(e.target.canvas.lowerCanvasEl.id)) {
                        continue;
                    }
                    self.state.canvas[i].discardActiveObject().renderAll();

                }
            });

            fabricCanvases.push(canvas);
        }

        this.setState({canvas: fabricCanvases});
    }

    setURL(url, e){
        this.setState({url});
        this.setState({holding: true,
                    pageX: e.pageX,
                    pageY: e.pageY});
    }

    // adding the signature onto the canvas
    addImage(canvas, url, x, y){
        fabric.Image.fromURL(url, function(signature) {
            var img = signature.set({ left: x - signature.width / 2, top: y - signature.height / 2});
            canvas.add(img);
        });
        this.setState({holding: false});
    }

    // deletes the signatures on the canvas that are selected
    delObject(event) {
        if(event.keyCode === 46) {
            this.setState({toSend: true});
            for (let i = 0; i < this.state.canvas.length; i++) {
                var activeObject = this.state.canvas[i].getActiveObjects();
                this.state.canvas[i].discardActiveObject();
                this.state.canvas[i].remove(...activeObject);
            }
        }     
    }

    sendEdit(id) {
        let currentRoom = this.state.roomKey;
        let canvasData = {
            json: this.state.canvas[id].toJSON(),
            id: id
        }
        this.state.socket.emit('editIn', {currentRoom, canvasData});
    }

    receiveEdit(canvasData) {
        this.state.canvas[canvasData.id].loadFromJSON(canvasData.json, this.state.canvas[canvasData.id].renderAll.bind(this.state.canvas[canvasData.id]));
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
        const username = queryString.parse(this.props.location.search).username
        const roomKey = queryString.parse(this.props.location.search).roomKey
        console.log(username, roomKey)
        // console.log(this.props.location.search)
        this.setState({username, roomKey},
            () => { this.setSocket(); 
        })
    }

    // componentWillReceiveProps(nextProps){
    //     if (nextProps.location.state === 'desiredState') {
    //         // do stuffs
    //     }
    // }
    
    componentDidMount(){
        this.handleQuery();

        document.addEventListener("keydown", this.delObject, false);
        // this.setSocket();
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
        const {canvas} = this.state;
        const {url} = this.state;
        const {holding} = this.state;

        return (
            <div onMouseMove={this.mouseMove}>
                <div id='canvas-container'>

                </div>
                <Signature
                    setURL={this.setURL}
                    canvas={canvas}
                    url={url}
                />
                {holding && <img src={url} alt='signature-placeholder' id="signature-placeholder"></img>}
            </div>
        );
    }
}

export default CollabPage;