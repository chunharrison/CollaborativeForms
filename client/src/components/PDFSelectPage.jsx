import React from "react";
import { Redirect, Link } from 'react-router-dom';
import PDFViewer from './PDFViewer';

class PDFSelectPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            canvas: null,
            imgDatas: null,
            pageHeight: 0,
            pageWidth: 0,
            redirect: false,
            userName: null,
            roomID: null
        }

        this.giveIDtoCanvases = this.giveIDtoCanvases.bind(this);
        this.pagesToDataURL = this.pagesToDataURL.bind(this);
        this.setRedirect = this.setRedirect(this);
        // this.testFunction = this.testFunction(this);
    }

    // set id=0, 1, 2, ... , n to all the canvases on the screen
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

    toCollabPage() {
        return <Redirect to={{
            pathname: '/collab',
            state: { imgDatas: this.state.imgDatas,
                    pageHeight: this.state.pageHeight,
                    pageWidth: this.state.pageWidth }
        }}/>
    }
    
    setRedirect() {
        this.setState({
            redirect: true
        })
    }

    testFunction() {

        return <Redirect to={{ 
            pathname: '/collab', 
            state: { 
                imgDatas: this.state.imgDatas, 
                pageHeight: this.state.pageHeight, 
                pageWidth: this.state.pageWidth } 
            }}/>
    }

    inputHandler = () => {

    }

    render() {
        
        // let redirectButton;
        // if (this.state.imgDatas !== null) {
        //     redirectButton = <button onClick={ this.setRedirect }> Go To Collaboration Page </button>
        //     console.log("redirectButton Hook has been updated!")
        // }

        // if (this.state.redirect === true) {
        //     return <Redirect to={{
        //         pathname: '/collab1',
        //         state: { imgDatas: this.state.imgDatas,
        //                 pageHeight: this.state.pageHeight,
        //                 pageWidth: this.state.pageWidth }
        //     }}/>
        // }
        
        // if (this.state.imgDatas !== null) {
        //     return <Redirect to={{
        //         pathname: '/collab1',
        //         state: { imgDatas: this.state.imgDatas,
        //                 pageHeight: this.state.pageHeight,
        //                 pageWidth: this.state.pageWidth }
        //     }}/>
        // }


        return (
        <div id='fabric-container' onMouseMove={this.mouseMove}>
            <PDFViewer></PDFViewer>
            <button onClick={ this.giveIDtoCanvases }>Hello1</button>
            <button onClick={ this.pagesToDataURL }>Hello2</button>
            {/* {redirectButton} */}
            <div>
                <input placeholder="Name" className="joinInput" type="text" onChange={(event) => this.setState({ userName: event.target.value })}></input>
            </div>
            <div>
                <input placeholder="Room" className="joinInput" type="text" onChange={(event) => this.setState({ roomID: event.target.value })}></input>
            </div>
            
            <Link onClick={event => (!this.state.userName || !this.state.roomID) ? event.preventDefault() : null} 
                to={{
                    pathname: `/collab?name=${this.state.userName}&room=${this.state.roomID}`,
                    state: {
                        imgDatas: this.state.imgDatas,
                        pageHeight: this.state.pageHeight,
                        pageWidth: this.state.pageWidth
                    }
                }}>
                <button className="button" type="submit">Enter</button>
            </Link>
        </div>
        );
    }
}

export default PDFSelectPage;