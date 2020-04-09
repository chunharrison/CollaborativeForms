import React from "react";
import { fabric } from 'fabric';
import Signature from './Signature';
import io from "socket.io-client";

class CollabPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            socket: null,
            endpoint: '127.0.0.1:5000',
            canvas: null,
            holding: false,
            toSend: false,
            canvasMounted: false,
            pageX: 0,
            pageY: 0
        }
        
        this.createCanvases = this.createCanvases.bind(this);
        this.getCanvases = this.getCanvases.bind(this);
        this.setURL = this.setURL.bind(this);
        this.addImage = this.addImage.bind(this);
        this.delObject = this.delObject.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.setSocket = this.setSocket.bind(this);
        this.sendEdit = this.sendEdit.bind(this);
        this.receiveEdit = this.receiveEdit.bind(this);
        
    }

    setSocket() {
            const socket = io(this.state.endpoint);            
            socket.on("canvasSetup", canvasData => this.getCanvases(canvasData));
            socket.on("editOut", canvasData => this.receiveEdit(canvasData));
            socket.on("needCanvas", canvasData => {
                if (typeof this.props.location.state !== 'undefined') {
                    this.sendCanvas();
                } else {
                    socket.emit('missingCanvas');
                }
            });
            this.setState({socket: socket});
    }

    createCanvases() {
        if (!this.state.canvasMounted) {
            let container = document.getElementById("canvas-container");
            let fabricCanvases = [];

            for (let i = 0; i < this.props.location.state.imgDatas.length; i++) {
                let newCanvas = document.createElement('canvas');
                newCanvas.id = i.toString();
                newCanvas.width = this.props.location.state.pageWidth;
                newCanvas.height = this.props.location.state.pageHeight;
                container.appendChild(newCanvas);
                let canvas = new fabric.Canvas(i.toString())
                let currentPage = this.props.location.state.imgDatas[i];
                canvas.setBackgroundImage(currentPage,canvas.renderAll.bind(canvas));
                let self = this;
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
                fabricCanvases.push(canvas);
            }

            this.setState({canvas: fabricCanvases,
                            canvasMounted: true}, () => {
                this.setSocket()
            })
        }

    }

    sendCanvas() {
        let canvas = [];
        for (let i = 0; i < this.state.canvas.length; i++) {
            canvas.push(this.state.canvas[i].toJSON());
        }

        let data = {
            canvas: canvas,
            pageCount: this.props.location.state.imgDatas.length,
            pageHeight: this.props.location.state.pageHeight,
            pageWidth: this.props.location.state.pageWidth
        }
        this.state.socket.emit('initCanvas', data);
    }
    
    getCanvases(canvasData) {
        if (!this.state.canvasMounted) {
            let container = document.getElementById("canvas-container");
            let fabricCanvases = [];

            for (let i = 0; i < canvasData.pageCount; i++) {
                let newCanvas = document.createElement('canvas');
                newCanvas.id = i.toString();
                newCanvas.width = canvasData.pageWidth;
                newCanvas.height = canvasData.pageHeight;
                container.appendChild(newCanvas);
                let canvas = new fabric.Canvas(i.toString());
                canvas.loadFromJSON(canvasData.canvas[i], canvas.renderAll.bind(canvas));

                let self = this;
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
                fabricCanvases.push(canvas);
            }

            this.setState({canvas: fabricCanvases,
                canvasMounted: true}, () => {
            })
        }
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
            for (let i = 0; i < this.state.canvas.length; i++) {
                var activeObject = this.state.canvas[i].getActiveObjects();
                this.state.canvas[i].discardActiveObject();
                this.state.canvas[i].remove(...activeObject);
            }
        }     
    }

    sendEdit(id) {
        let data = {json: this.state.canvas[id].toJSON(),
                    id: id}
        this.state.socket.emit('editIn', data);
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

    componentDidMount(){
        document.addEventListener("keydown", this.delObject, false);
        if (typeof this.props.location.state !== 'undefined') {
            this.createCanvases();
        } else {
            this.setSocket();
        }
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