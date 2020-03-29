import React from "react";
import { fabric } from 'fabric';
import Signature from './Signature';

class CollabPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            canvas: null,
            holding: false,
            pageX: 0,
            pageY: 0
        }
        
        this.convertCanvases = this.convertCanvases.bind(this);
        this.setURL = this.setURL.bind(this);
        this.addImage = this.addImage.bind(this);
        this.delObject = this.delObject.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        
    }

    convertCanvases() {
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

    mouseMove(e) {
        if(this.state.holding) {
            let image = document.getElementById('signature-placeholder')
            image.style.top = e.pageY + 'px';
            image.style.left = e.pageX + 'px';
        }
    }

    componentDidMount(){
        document.addEventListener("keydown", this.delObject, false);
        this.convertCanvases();
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