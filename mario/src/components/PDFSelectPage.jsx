import React from "react";
import { Redirect } from 'react-router-dom';
import PDFViewer from './PDFViewer';

class PDFSelectPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            canvas: null,
            imgDatas: null,
            pageHeight: 0,
            pageWidth: 0,
            redirectCollab: false
        }

        this.giveIDtoCanvases = this.giveIDtoCanvases.bind(this);
        this.pagesToDataURL = this.pagesToDataURL.bind(this);
        this.redirect = this.redirect.bind(this);
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

        this.setState({imgDatas: imageDatas,
                        pageHeight: canvases[0].height,
                        pageWidth: canvases[0].width});
    }

    redirect() {
        this.setState({redirectCollab: true});
    }

    render() {

        if (this.state.imgDatas !== null) {
            return <Redirect to={{
                pathname: '/collab',
                state: { imgDatas: this.state.imgDatas,
                        pageHeight: this.state.pageHeight,
                        pageWidth: this.state.pageWidth }
            }}/>
        }

        return (
        <div id='fabric-container' onMouseMove={this.mouseMove}>
            <PDFViewer></PDFViewer>
            <button onClick={ this.giveIDtoCanvases }>Hello1</button>
            <button onClick={ this.pagesToDataURL }>Hello2</button>
        </div>
        );
    }
}

export default PDFSelectPage;