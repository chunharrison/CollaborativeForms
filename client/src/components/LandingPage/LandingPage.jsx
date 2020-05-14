import React from "react";
import { Link, Redirect } from 'react-router-dom';
import { nanoid } from 'nanoid';
import PDFViewer from '../PDFViewer/PDFViewer';
import axios from 'axios';
import Tour from 'reactour';

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
            showProgressBar: false,

            usernameCreate: null,
            usernameJoin: null,
            roomKey: null,
            redirect: null,

            createRoomAlertVisible: false,
            createRoomFileAlertOutline: '',
            createRoomNameAlertOutline: '',

            joinRoomAlertVisible: false,
            joinRoomRoomCodeAlertOutline: '',
            joinRoomNameAlertOutline: '',
            joinRoomAlertTimeout: null,

            invalidPDFAlertVisible: false,
        }

        this.fileInputRef = React.createRef();
        this.createRoomAlertTimeout = null;
        this.createRoomAlertTimeoutSF = null;
        this.createRoomAlertTimeoutUN = null;
        this.joinRoomAlertTimeout = null;
        this.joinRoomAlertTimeoutRC = null;
        this.joinRoomAlertTimeoutUN = null;

        this.uploadFile = this.uploadFile.bind(this);
        this.onPDFUpload = this.onPDFUpload.bind(this);

        // Alert messages
        this.onCreateRoomAlert = this.onCreateRoomAlert.bind(this);
        this.onJoinRoomAlert = this.onJoinRoomAlert.bind(this);
        this.onInvalidPDFAlert = this.onInvalidPDFAlert.bind(this);

        // PDF preview Modal
        this.handleClosePDFModal = this.handleClosePDFModal.bind(this);
        this.handleShowPDFModal = this.handleShowPDFModal.bind(this);

        // Intro
        this.closeTour = this.closeTour.bind(this);
    }

    uploadFile() {
        const { selectedFile } = this.state;
        const contentType = selectedFile.type; // eg. image/jpeg or image/svg+xml
        const generatePutUrl = `${process.env.REACT_APP_BACKEND_ADDRESS}/api/generate-put-url`;
        let options = {
            params: {
                Key: `${this.state.roomKey}.pdf`,
                ContentType: contentType
            },
            headers: {
                'Content-Type': contentType,
            },
        };
        axios.get(generatePutUrl, options).then(res => {
          const {
            data: { putURL }
          } = res;
          this.setState({showProgressBar: true});
          //upload file via url that was sent back from the server
          axios
            .put(putURL, selectedFile)
            .then(res => {
            //   console.log('success');
              this.setState({showPDFModal: false,
                            showProgressBar:false});
            })
            .catch(err => {
            //   console.log('err', err);
              this.setState({showPDFModal: false,
                            showProgressBar:false});
            });
        });
    };


    // triggers when PDF file is uploaded, 
    // generates a unique room key if there isn't one
    onPDFUpload = event => {
        if (this.state.roomKey === null) {
            this.setState ( {
                roomKey: nanoid()
            })
        }

        if (event.target.files[0]) {
            this.setState ({
                selectedFile: event.target.files[0],
                selectedFileName: event.target.files[0].name,
                pdfViewer: <PDFViewer renderFive={true} selectedFile={event.target.files[0]}></PDFViewer>,
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

        clearTimeout(this.createRoomAlertTimeout)
        this.setState({ createRoomAlertVisible: true }, () => { 
            this.createRoomAlertTimeout = window.setTimeout(()=>{
                this.setState({ createRoomAlertVisible: false })
            }, 3500)
        });

        if (this.state.selectedFile === null) {
            clearTimeout(this.createRoomAlertTimeoutSF)
            this.setState({ 
                createRoomFileAlertOutline: 'alert-outline-createroomfile'
            }, () => { 
                this.createRoomAlertTimeoutSF = window.setTimeout(()=>{
                    this.setState({ 
                        createRoomFileAlertOutline: ''
                    })
                }, 3500)
            });
        } else {
            this.setState({ createRoomFileAlertOutline: '' })
        }

        if (this.state.usernameCreate === null || this.state.usernameCreate === '') {
            clearTimeout(this.createRoomAlertTimeoutUN)
            this.setState({ createRoomNameAlertOutline: 'alert-outline-createroomname' }, () => { 
                this.createRoomAlertTimeoutUN = window.setTimeout(()=>{
                    this.setState({ createRoomNameAlertOutline: '' })
                }, 3500)
            });
        } else {
            this.setState({ createRoomNameAlertOutline: '' })
        }
    }

    // triggers when a person tries to enter an existing room without giving required info
    // it shows an alert for 3 seconds indicating which info is needed
    // this is maybe retarded way of doing this idk aha
    onJoinRoomAlert = (event) => {
        event.preventDefault()

        clearTimeout(this.joinRoomAlertTimeout)
        this.setState({ joinRoomAlertVisible: true }, () => {
            this.joinRoomAlertTimeout = window.setTimeout(() => {
                this.setState({ joinRoomAlertVisible: false })
            }, 3500)
        });

        if (this.state.roomKey === null || this.state.roomKey === '') {
            clearTimeout(this.joinRoomAlertTimeoutRC)
            this.setState({ joinRoomRoomCodeAlertOutline: 'alert-outline-joinroomcode' }, () => { 
                this.joinRoomAlertTimeoutRC = window.setTimeout(()=>{
                    this.setState({ joinRoomRoomCodeAlertOutline: '' })
                }, 3500)
            });
        } else {
            this.setState({ joinRoomRoomCodeAlertOutline: '' })
        }

        if (this.state.usernameJoin === null || this.state.usernameJoin === '') {
            clearTimeout(this.joinRoomAlertTimeoutUN)
            this.setState({ joinRoomNameAlertOutline: 'alert-outline-joinroomname' }, () => { 
                this.joinRoomAlertTimeoutUN = window.setTimeout(()=>{
                    this.setState({ joinRoomNameAlertOutline: '' })
                }, 3500)
            });
        } else {
            this.setState({ joinRoomNameAlertOutline: '' })
        }
    }

    onInvalidPDFAlert = () => {
        this.setState({ invalidPDFAlertVisible: true }, () => {
            window.setTimeout(() => {
                this.setState({ invalidPDFAlertVisible: false})
            }, 5000)
        })
    }

    // closes the PDF viewer modal
    handleClosePDFModal = (event, accepted) => {
        // event.preventDefault();
        // the error message shows whenever a person uploads any file other than PDF
        const errorMessage = document.getElementsByClassName('react-pdf__message react-pdf__message--error') 
        const largePDFMessage = document.getElementsByClassName('too-large-pdf')
        
        if (accepted && errorMessage.length === 0 && largePDFMessage.length === 0) {
            this.uploadFile()
        } else {

            if (errorMessage.length !== 0) {
                this.onInvalidPDFAlert();
            }

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
        return this.state.alertMessages.map((msg) =>
            <p>
                {msg}
            </p>
        )
    }

    //Close intro popup
    closeTour() {
        this.setState({isTourOpen: false})
    }

    componentDidMount() {
        let visited = localStorage["landingPageVisited"];
        if(visited) {
            this.setState({mounted: true,
                isTourOpen: false});
        } else {
             //this is the first time
             localStorage["landingPageVisited"] = true;
             this.setState({mounted: true,
                isTourOpen: true});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.imgDatas === null && prevState.imgDatas !== this.state.imgDatas) {
            this.setState({
                showPDFModal: false
            })
        }

    }

    render() {
        let fileValue = ''
        if (this.fileInputRef.current === null || typeof this.fileInputRef.current.files[0] === 'undefined') {
            fileValue = 'File...';
        } else {
            fileValue = this.fileInputRef.current.files[0].name;
        }

        //Order in which insturcitons will appear
        const steps = [
            {
                selector: '',
                content: 'Welcome to Cosign! Host PDF documents and sign them real-time with others.',
            },
            {
                selector: '',
                content: 'Create a room with your own PDF document or join an existing room created by someone else.',
            },
            {
                selector: '.create-room',
                content: 'To create a room, the "Create Room" section must be used.',
            },
            {
                selector: '.file-input-container',
                content: 'Select a PDF document of your choice with the "Browse" button.',
            },
            {
                selector: '.name-input',
                content: 'Enter a username that you think will help others to identify you in the room.',
            },
            {
                selector: '.create-room-button',
                content: 'And finally, click the "Create Room" button to enter.',
            },
            {
                selector: '.join-room',
                content: 'If a room has already been created by another user, you can join it by using the "Join Room" section.',
            },
            {
                selector: '.join-room-input',
                content: 'Ask any user currently in the room for the room code and paste it into this box.',
            },
            {
                selector: '.join-name-input',
                content: 'Enter a username that you think will help others to identify you in the room.',
            },
            {
                selector: '.join-room-button',
                content: 'And finally, click the "Join Room" button to enter.',
            },
            {
                selector: '.nav',
                content: 'To view this tutorial again the "Tutorial" button can be clicked.',
            },
        ]

        return (
            <div className='grid-container'>
                <p onClick={() => this.setState({isTourOpen: true})} className="nav">Tutorial</p>
                <div className='create-room-container'>
                    <div className='create-room'>
                        <p className='room-header'>CREATE ROOM</p>
                        <div className={`file-input-container ${this.state.createRoomFileAlertOutline}`}>
                            <input type="text" className='selected-file' value={fileValue} disabled></input>
                            <label htmlFor="pdf-file-input" className='custom-file-upload'>
                                Browse
                            </label>
                            <input id="pdf-file-input" type="file" name="file" ref={this.fileInputRef} onChange={this.onPDFUpload}/>
                        </div>
                        <input placeholder="Name..." className={`name-input ${this.state.createRoomNameAlertOutline}`} type="text" onChange={(event) => this.setState({ usernameCreate: event.target.value })}></input>
                        <Link 
                            onClick={event => (!this.state.usernameCreate || !this.state.selectedFile) ? this.onCreateRoomAlert(event) : null} 
                            to={{
                                pathname: `/collab`,
                                search: `?username=${this.state.usernameCreate}&roomCode=${this.state.roomKey}&action=create`
                            }}>
                            <Button variant="primary" type="submit" className='create-room-button'>Create Room</Button>
                        </Link>
                    </div>
                </div>
                <div className='join-room-container'>
                    <div className='join-room'>
                        <p className='join-room-header'>JOIN ROOM</p>
                        <input placeholder="Room Code..." className={`join-room-input ${this.state.joinRoomRoomCodeAlertOutline}`} type="text" 
                            onChange={(event) => this.setState({ roomKey: event.target.value })}></input>
                        <input placeholder="Name..." className={`join-name-input ${this.state.joinRoomNameAlertOutline}`} type="text" 
                            onChange={(event) => this.setState({ usernameJoin: event.target.value })}></input>
                        <Link onClick={event => (!this.state.usernameJoin || !this.state.roomKey) ? this.onJoinRoomAlert(event) : null} 
                            to={{ pathname: `/collab`,
                                search: `?username=${this.state.usernameJoin}&roomCode=${this.state.roomKey}&action=join`, }}>
                            <Button variant="primary" className='create-room-button join-room-button' type="submit">Enter Room</Button>
                        </Link>
                    </div>
                </div>
                <Alert variant='danger' show={this.state.createRoomAlertVisible || this.state.joinRoomAlertVisible}>
                    Make sure you included all the required information. 
                </Alert>
                <Alert variant='danger' show={this.state.invalidPDFAlertVisible}>
                    Make sure the provided file is a PDF document.
                </Alert>
                <Modal show={this.state.showPDFModal} onHide={(event) => this.handleClosePDFModal(event, false)} size="xl">
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.selectedFileName} (preview)</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='modal-body'>
                        {this.state.showProgressBar ? null : this.state.pdfViewer}
                        {this.state.showProgressBar ? 
                        <div style={{height: '500px'}}>
                            <div className="wrapper">
                                <span className="circle circle-1"></span>
                                <span className="circle circle-2"></span>
                                <span className="circle circle-3"></span>
                                <span className="circle circle-4"></span>
                                <span className="circle circle-5"></span>
                                <span className="circle circle-6"></span>
                            </div>
                        </div>
                        :
                        null}
                    </Modal.Body>
                    <Modal.Footer>
                    {this.state.showProgressBar ? null :
                        <Button variant="primary" onClick={(event) => this.handleClosePDFModal(event, true)}>
                            Okay
                        </Button>}
                    </Modal.Footer>
                </Modal>
                <Tour
                steps={steps}
                isOpen={this.state.isTourOpen}
                onRequestClose={this.closeTour}/>
            </div> 
        );
    }
}

export default LandingPage;