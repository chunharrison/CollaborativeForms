import React from "react";
import { Link, Redirect } from 'react-router-dom';
import { nanoid } from 'nanoid';
import PDFViewer from '../PDFViewer/PDFViewer';

// Components
import Button from 'react-bootstrap/Button';
// import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';


// css
import './LandingPage.css';

class LandingPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            canvas: null,
            imgDatas: null,
            pageHeight: null,
            pageWidth: null,
            selectedFile: null,
            selectedFileName: 'PDF File',
            pdfViewer: null,
            showPDFModal: false,

            usernameCreate: null,
            usernameJoin: null,
            roomKey: null,
            redirect: null,

            createRoomAlertVisible: false,
            joinRoomAlertVisible: false,

            endpoint: '127.0.0.1:5000'
        }

        this.fileInputRef = React.createRef();

        this.pagesToDataURL = this.pagesToDataURL.bind(this);
        this.onPDFUpload = this.onPDFUpload.bind(this);

        // Alert messages
        this.onCreateRoomAlert = this.onCreateRoomAlert.bind(this);
        this.onJoinRoomAlert = this.onJoinRoomAlert.bind(this);

        // PDF preview Modal
        this.handleClosePDFModal = this.handleClosePDFModal.bind(this);
        this.handleShowPDFModal = this.handleShowPDFModal.bind(this);
    }

    // change currently rendered canvases to dataURLs 
    pagesToDataURL() {
        let canvases = document.getElementsByClassName('react-pdf__Page__canvas');
        let imageDatas = [];
        var pdfLength = canvases.length;
        for (var i = 0; i < pdfLength; i++) {
            let canvas = canvases[i];
            canvas.id = i // set id=0, 1, 2, ... , n to all the canvases on the screen
            imageDatas.push(canvas.toDataURL("image/jpeg", 1.0));
        };

        this.setState({imgDatas: imageDatas,
                        pageHeight: canvases[0].height,
                        pageWidth: canvases[0].width});
    }


    // triggers when PDF file is uploaded, 
    // generates a unique room key if there isn't one
    onPDFUpload = event => {
        // console.log(event.target.files[0])
        if (this.state.roomKey === null) {
            this.setState ( {
                roomKey: nanoid()
            })
        }

        if (event.target.files[0]) {
            this.setState ({
                selectedFile: event.target.files[0],
                selectedFileName: event.target.files[0].name,
                pdfViewer: <PDFViewer selectedFile={event.target.files[0]}></PDFViewer>,
                showPDFModal: true
            }, () => {
                this.handleShowPDFModal();
            })
    
        }
    }

    // triggers when a person tries to create a new room without giving required info
    // it shows an alert for few seconds indicating which info is needed
    onCreateRoomAlert = (event) => {
        event.preventDefault()

        this.setState({ createRoomAlertVisible: true }, () => { 
            window.setTimeout(()=>{
                this.setState({ createRoomAlertVisible: false })
            }, 5000)
        });
    }

    // triggers when a person tries to enter an existing room without giving required info
    // it shows an alert for 3 seconds indicating which info is needed
    onJoinRoomAlert = (event) => {
        event.preventDefault()

        this.setState({ joinRoomAlertVisible: true }, () => {
            window.setTimeout(() => {
                this.setState({ joinRoomAlertVisible: false })
            },3000)
        });
    }

    // closes the PDF viewer modal
    handleClosePDFModal = (event, accepted) => {
        // event.preventDefault();
        if (accepted) {
            this.pagesToDataURL()
        } else {
            this.setState({
                selectedFile: null,
                selectedFileName: null,
                pdfViewer: null,
                showPDFModal: false
            })
            document.getElementById("pdf-file-input").value = "";
        }
    }

    // opens the PDF viewer modal
    handleShowPDFModal = () => {
        this.setState({
            imgDatas: null, // resets the imgDatas to make sure we have the data of the new PDF
            pageHeight: 0,
            pageWidth: 0,
            showPDFModal: true
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.imgDatas === null && prevState.imgDatas !== this.state.imgDatas) {
            this.setState({
                showPDFModal: false
            })
        }
        console.log(this.fileInputRef);
    }

    render() {

        let fileValue = ''
        if (this.fileInputRef.current === null || typeof this.fileInputRef.current.files[0] === 'undefined') {
            fileValue = 'File...';
        } else {
            fileValue = this.fileInputRef.current.files[0].name;
        }

        return (
            <div className='grid-container'>
                <div className='create-room-container'>
                    <div className='create-room'>
                        <p className='room-header'>CREATE ROOM</p>
                        <div className='file-input-container'>
                            <input type="text" className='selected-file' value={fileValue} disabled></input>
                            <label for="pdf-file-input" className="custom-file-upload">
                                Browse
                            </label>
                            <input id="pdf-file-input" type="file" name="file" ref={this.fileInputRef} onChange={this.onPDFUpload}/>
                        </div>
                        <input placeholder="Name..." className="name-input" type="text" onChange={(event) => this.setState({ usernameCreate: event.target.value })}></input>
                        <Link onClick={event => (!this.state.usernameCreate || !this.state.selectedFile) ? this.onCreateRoomAlert(event) : null} 
                            to={{
                                pathname: `/collab`,
                                search: `?username=${this.state.usernameCreate}&roomKey=${this.state.roomKey}`,
                                state: {
                                    imgDatas: this.state.imgDatas,
                                    pageHeight: this.state.pageHeight,
                                    pageWidth: this.state.pageWidth
                                }
                            }}>
                            <Button variant="primary" type="submit" className='create-room-button'>Create Room</Button>
                        </Link>
                    </div>
                </div>
                <div className='join-room-container'>
                    <div className='join-room'>
                        <p className='join-room-header'>JOIN ROOM</p>
                        <input placeholder="Room Code..." className="join-room-input" type="text" onChange={(event) => this.setState({ roomKey: event.target.value })}></input>
                        <input placeholder="Name..." className="join-name-input" type="text" onChange={(event) => this.setState({ usernameJoin: event.target.value })}></input>
                        <Link onClick={event => (!this.state.usernameJoin || !this.state.roomKey) ? this.onJoinRoomAlert(event) : null} 
                            to={{ pathname: `/collab`,
                                search: `?username=${this.state.usernameCreate}&roomKey=${this.state.roomKey}`, }}>
                            <Button variant="primary" className='create-room-button' type="submit">Enter Room</Button>
                        </Link>
                    </div>
                </div>
                <Alert variant='danger' show={this.state.createRoomAlertVisible || this.state.joinRoomAlertVisible}>
                    Make sure you included all the required information. 
                </Alert>
                <Modal show={this.state.showPDFModal} onHide={(event) => this.handleClosePDFModal(event, false)} size="xl">
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.selectedFileName} (preview)</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='modal-body'>
                        {this.state.pdfViewer}
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="primary" onClick={(event) => this.handleClosePDFModal(event, true)}>
                        Okay
                    </Button>
                    </Modal.Footer>
                </Modal>
            </div> 
        );
    }
}

export default LandingPage;