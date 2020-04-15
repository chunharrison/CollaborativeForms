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

            alertMessages: []
        }

        this.pagesToDataURL = this.pagesToDataURL.bind(this);
        this.onPDFUpload = this.onPDFUpload.bind(this);
        this.onCreateRoomAlert = this.onCreateRoomAlert.bind(this);
        this.onJoinRoomAlert = this.onJoinRoomAlert.bind(this);
        this.handleClosePDFModal = this.handleClosePDFModal.bind(this);
        this.handleShowPDFModal = this.handleShowPDFModal.bind(this);

        // this.setRedirect = this.setRedirect.bind(this); // <Redirect> option
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

        let messages = [];
        if (!this.state.usernameCreate) {
            messages.push('- Make sure to provide a name that other people will recognize you by')
        } 
        if (!this.state.selectedFile) {
            messages.push('- Upload the PDF you wish to collborate with others')
        }

        console.log(this.state.alertMessages)

        this.setState({
            alertMessages: messages,
            createRoomAlertVisible: true
        },()=>{
            window.setTimeout(()=>{
                this.setState({
                    createRoomAlertVisible: false,
                    alertMessages: []
                })
            }, 5000)
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

    generateAlertMessages() {
        console.log(this.state.alertMessages)
        return this.state.alertMessages.map((msg) =>
            <p>
                {msg}
            </p>
        )
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.imgDatas === null && prevState.imgDatas !== this.state.imgDatas) {
            this.setState({
                showPDFModal: false
            })
        }
    }

    toDataUrlsButtonToggle() {

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
                                        <input id="pdf-file-input" type="file" name="file" onChange={this.onPDFUpload}/>
                                        <input placeholder="Name..." className="joinInput" type="text" onChange={(event) => this.setState({ usernameCreate: event.target.value })}></input>
                                    </Card.Body>
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
                                        to={{ pathname: `/collab`,
                                            search: `?username=${this.state.usernameCreate}&roomKey=${this.state.roomKey}`, }}>
                                        <Button variant="primary" type="submit">Enter Room</Button>
                                    </Link>
                                    {/* <Redirect> option */}
                                    {/* {this.joinRoom()}
                                    <Button variant="primary" onClick={(event) => this.setRedirect(event)}>Enter Room</Button> */}
                                </Card>

                            </Col>
                        </Row>
                        <Alert variant='danger' show={this.state.createRoomAlertVisible || this.state.joinRoomAlertVisible}>
                            ERROR
                        </Alert>
                        {/* <Alert variant='danger' show={this.state.joinRoomAlertVisible}>No Room Key has been given</Alert> */}
                    </Container>
                </div>
                {/* <Button id='accept-pdf'>Accept</Button> */}
                <Modal show={this.state.showPDFModal} onHide={(event) => this.handleClosePDFModal(event, false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.selectedFileName}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.pdfViewer}
                    </Modal.Body>
                    <Modal.Footer>
                        {/* {this.handleClosePDFModal} */}
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