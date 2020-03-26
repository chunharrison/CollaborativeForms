import React from "react";
import { fabric } from 'fabric';
import Signature from './Signature';

class FabricReact extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            canvas: null,
            url: null,
            holding: false,
            pageY: null,
            pageX: null
        }

        this.addImage = this.addImage.bind(this);
        this.delObject = this.delObject.bind(this);
        this.setURL = this.setURL.bind(this);
        this.convertCanvases = this.convertCanvases.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
    }

    convertCanvases() {
        let vanillaCanvases = document.getElementById('fabric-container').getElementsByTagName('canvas');
        let canvasCount = vanillaCanvases.length;
        let fabricCanvases = [];

        for (let i = 0; i < canvasCount; i++) {
            let canvas = new fabric.Canvas(i.toString(), {backgroundColor : "white"})
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

    addImage(canvas, url, x, y){
        fabric.Image.fromURL(url, function(signature) {
            var img = signature.set({ left: x - signature.width / 2, top: y - signature.height / 2});
            canvas.add(img); 
        });
        this.setState({holding: false});
    }

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

    componentDidMount() {
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
        <div id='fabric-container' onMouseMove={this.mouseMove}>
            <div id='space'></div>
            <canvas id='0' width={600} height={400} />
            <div id='space'></div>
            <canvas id='1' width={600} height={400} />
            <Signature
            setURL={this.setURL}
            canvas={canvas}
            url={url}
            >
            </Signature>
            {holding && <img src={url} alt='signature-placeholder' id="signature-placeholder"></img>}
        </div>
        );
    }
}

export default FabricReact;