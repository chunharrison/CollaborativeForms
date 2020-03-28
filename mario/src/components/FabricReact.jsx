import React from "react";
import { fabric } from 'fabric';
import Signature from './Signature';
import PDFViewer from './PDFViewer';

class FabricReact extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            canvas: null,
            url: null,
            holding: false,
            pageY: null,
            pageX: null,
            imgDatas: null
        }

        this.addImage = this.addImage.bind(this);
        this.delObject = this.delObject.bind(this);
        this.setURL = this.setURL.bind(this);
        this.convertCanvases = this.convertCanvases.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.giveIDtoCanvases = this.giveIDtoCanvases.bind(this);
        this.pagesToDataURL = this.pagesToDataURL.bind(this);
    }

    giveIDtoCanvases() {
        let canvases = document.getElementsByClassName('react-pdf__Page__canvas');
        for (let i = 0; i < canvases.length; i++) {
            let canvas = canvases[i]
            canvas.id = i
        }
    }

    pagesToDataURL() {
        let canvases = document.getElementsByClassName('react-pdf__Page__canvas');
        let imageDatas = [];

        var pdfLength = canvases.length;
        for (var i = 0; i < pdfLength; i++) {
            let canvas = canvases[i];
            imageDatas.push(canvas.toDataURL("image/jpeg", 1.0));
        };

        this.setState({imgDatas: imageDatas})
    }

    // Converts all the canvases that are in the DOM into fabric canvases
    convertCanvases() {
        let canvases = document.getElementsByClassName('react-pdf__Page__canvas');
        let canvasCount = canvases.length;
        let fabricCanvases = [];
        for (let i = 0; i < canvasCount; i++) {
            let canvas = new fabric.Canvas(i.toString())
            let currentPage = this.state.imgDatas[i];
            canvas.setBackgroundImage(currentPage,canvas.renderAll.bind(canvas))
            let self = this;
            canvas.on('mouse:up', function(e) {
                let currentCanvas = self.state.canvas[parseInt(e.e.target.previousElementSibling.id)]
                if (self.state.holding){
                    self.addImage(currentCanvas, self.state.url, e.pointer.x, e.pointer.y);
                    self.setState({holding: false});
                }
            });
            fabricCanvases.push(canvas);
        }

        this.setState({canvas: fabricCanvases});
    }

    // parent function for the signature component
    // sets the image url to the current singaure being held by the cursor
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

    // have the signature follow the cursor
    mouseMove(e) {
        if(this.state.holding) {
            let image = document.getElementById('signature-placeholder')
            image.style.top = e.pageY + 'px';
            image.style.left = e.pageX + 'px';
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.delObject, false);
        // this.convertCanvases();
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
        <div id='fabric-container' onMouseMove={this.mouseMove}>
            {/* <div id='space'></div>
            <canvas id='0' width={600} height={400} />
            <div id='space'></div>
            <canvas id='1' width={600} height={400} /> */}
            <Signature
            setURL={this.setURL}
            canvas={canvas}
            url={url}
            >
            </Signature>
            {holding && <img src={url} alt='signature-placeholder' id="signature-placeholder"></img>}
            <button onClick={ this.giveIDtoCanvases }>Hello1</button>
            <button onClick={ this.pagesToDataURL }>Hello2</button>
            <button onClick={ this.convertCanvases }>Hello3</button>
        </div>
        );
    }
}

export default FabricReact;