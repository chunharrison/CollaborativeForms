import React from "react";
import { Link, Redirect } from 'react-router-dom';
import { nanoid } from 'nanoid';
import PDFViewer from '../PDFViewer/PDFViewer';

// Components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
// import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';


// css
import './LandingPage.css';

class PDFSelectPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            canvas: null,
            imgDatas: null,
            pageHeight: 0,
            pageWidth: 0,
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

            alertMessage: ''
        }

        // this.giveIDtoCanvases = this.giveIDtoCanvases.bind(this);
        this.pagesToDataURL = this.pagesToDataURL.bind(this);
        this.onPDFUpload = this.onPDFUpload.bind(this);
        this.onCreateRoomAlert = this.onCreateRoomAlert.bind(this);
        this.onJoinRoomAlert = this.onJoinRoomAlert.bind(this);
        this.handleClosePDFModal = this.handleClosePDFModal.bind(this);
        this.handleShowPDFModal = this.handleShowPDFModal.bind(this);

        // this.setRedirect = this.setRedirect.bind(this); // <Redirect> option
    }

    // // set id=0, 1, 2, ... , n to all the canvases on the screen
    // giveIDtoCanvases() {
    //     let canvases = document.getElementsByClassName('react-pdf__Page__canvas');
    //     for (let i = 0; i < canvases.length; i++) {
    //         let canvas = canvases[i]
    //         canvas.id = i
    //     }
    // }

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

        this.setState ({
            selectedFile: event.target.files[0],
            selectedFileName: event.target.files[0].name,
            pdfViewer: <PDFViewer selectedFile={event.target.files[0]}></PDFViewer>,
            showPDFModal: true
        }, () => {
            this.handleShowPDFModal();
        })

        
    }

    // triggers when a person tries to create a new room without giving required info
    // it shows an alert for 3 seconds indicating which info is needed
    onCreateRoomAlert = (event) => {
        event.preventDefault()

        // let message = [];
        // if (!this.state.usernameCreate) {
        //     message.push('Make sure to provide your name so other people can recognize you')
        // } else if (!this.state.)

        this.setState({
            createRoomAlertVisible: true
        },()=>{
            window.setTimeout(()=>{
                this.setState({
                    createRoomAlertVisible: false
                })
            },3000)
        });
    }

    // triggers when a person tries to enter an existing room without giving required info
    // it shows an alert for 3 seconds indicating which info is needed
    onJoinRoomAlert = (event) => {
        event.preventDefault()
        this.setState({joinRoomAlertVisible: true},()=>{
            window.setTimeout(()=>{
                this.setState({joinRoomAlertVisible: false})
            },3000)
        });
    }

    // closes the PDF viewer modal
    handleClosePDFModal = () => {
        if (this.state.imgDatas !== null) { // makes sure that we acquired imgDatas before closing the modal
            this.setState({
                showPDFModal: false
            })
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

    // <Redirect> option
    // setRedirect = (event) => {
    //     event.preventDefault()
    //     this.setState({
    //         redirect: true
    //     })
    // }

    // <Redirect> option
    // joinRoom() {
    //     if (this.state.redirect && 
    //         this.state.username !== null && 
    //         this.state.roomKey !== null) {
    //         return <Redirect to={{ pathname: `/collab?username=${this.state.username}&roomKey=${this.state.roomKey}` }}/>
    //     }
    // }

    render() {

        return (
            <div className='enter-options-container'>
                <div className='enter-options'>
                    <Container className="row-col-container">
                        <Row>
                            <Col className="enter-option-col-1">
                                <Card>
                                    <Card.Header as="h5">Create a New Room</Card.Header>
                                    <Card.Body>
                                        <input type="file" name="file" onChange={this.onPDFUpload}/>
                                        <input placeholder="Name..." className="joinInput" type="text" onChange={(event) => this.setState({ usernameCreate: event.target.value })}></input>
                                    </Card.Body>
                                    <Link onClick={event => (!this.state.usernameCreate || !this.state.selectedFile) ? this.onCreateRoomAlert(event) : null} 
                                        to={{
                                            pathname: `/collab?username=${this.state.usernameCreate}&roomKey=${this.state.roomKey}`,
                                            state: {
                                                imgDatas: this.state.imgDatas,
                                                pageHeight: this.state.pageHeight,
                                                pageWidth: this.state.pageWidth
                                            }
                                        }}>
                                        <Button variant="primary" type="submit">Create Room</Button>
                                    </Link>
                                </Card>

                            </Col>
                            <Col className="enter-option-col-2">
                                <Card>
                                    <Card.Header as="h5">Join an Existing Room</Card.Header>
                                    <Card.Body>
                                        <input placeholder="Room Key" className="joinInput" type="text" onChange={(event) => this.setState({ roomKey: event.target.value })}></input>
                                        <input placeholder="Name..." className="joinInput" type="text" onChange={(event) => this.setState({ usernameJoin: event.target.value })}></input>
                                    </Card.Body>
                                    <Link onClick={event => (!this.state.usernameJoin || !this.state.roomKey) ? this.onJoinRoomAlert(event) : null} 
                                        to={{ pathname: `/collab?username=${this.state.usernameJoin}&roomKey=${this.state.roomKey}` }}>
                                        <Button variant="primary" type="submit">Enter Room</Button>
                                    </Link>
                                    {/* <Redirect> option */}
                                    {/* {this.joinRoom()}
                                    <Button variant="primary" onClick={(event) => this.setRedirect(event)}>Enter Room</Button> */}
                                </Card>

                            </Col>
                        </Row>
                        <Alert variant='danger' show={this.state.createRoomAlertVisible}>No PDF file has been uploaded</Alert>
                        <Alert variant='danger' show={this.state.joinRoomAlertVisible}>No Room Key has been given</Alert>
                    </Container>
                </div>
                <Modal show={this.state.showPDFModal} onHide={this.handleClosePDFModal} size="lg" onEntered={() => this.pagesToDataURL()}>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.selectedFileName}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.pdfViewer}
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="primary" onClick={this.handleClosePDFModal}>
                        Okay
                    </Button>
                    </Modal.Footer>
                </Modal>
            </div> 
        );
    }
}

export default PDFSelectPage;