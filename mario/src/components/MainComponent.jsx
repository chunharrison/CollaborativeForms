import React from "react";
import { fabric } from 'fabric';
import Signature from './Signature';

class MainComponent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            canvas: null,
        }

        this.addImage = this.addImage.bind(this);
        this.delFunction = this.delFunction.bind(this);
    }

    addImage(canvas, url){
        fabric.Image.fromURL(url, function(myImg) {
            //i create an extra var for to change some image properties
            var img1 = myImg.set({ left: 0, top: 0});
            img1.scaleToHeight(150);
            img1.scaleToWidth(150);
            canvas.add(img1); 
        });
    }

    componentDidMount() {
        document.addEventListener("keydown", this.delFunction, false);
        const canvas = new fabric.Canvas(this.c, {backgroundColor : "white"})
        this.addImage(canvas);
        this.setState({ canvas })
    }

    delFunction(event) {
        if(event.keyCode === 46) {
            for (canvas in this.state.canvas) {
                var activeObject = canvas.getActiveObjects();
                canvas.discardActiveObject();
                canvas.remove(...activeObject);
            }
        }     
    }

    componentWillUnmount(){
        document.removeEventListener("keydown", this.escFunction, false);
    }

    render() {
        let canvas = this.state.canvas;

        return (
        <div>
            <canvas ref={c => (this.c = c)} id='canvas' width={600} height={400} />
            <Signature
            addImage={this.addImage}
            canvas={canvas}
            >
            </Signature>
        </div>
        );
    }
}

export default MainComponent;