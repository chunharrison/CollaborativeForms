import React, { useState, useEffect } from 'react';
import {withRouter} from 'react-router-dom';
//Libraries
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import { nanoid } from 'nanoid';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';


//components
import PDFViewer from '../PDFViewer/PDFViewer';

import addImg from './add.png';

const CreateDocument = props => {
    
    const [roomKey, setRoomKey] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState(null);
    const [pdfViewer, setPdfViewer] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [showProgressBar, setShowProgressBar] = useState(false);
    const [invalidPdfAlertVisible, setInvalidPdfAlertVisible] = useState(false);

    useEffect(() => {
        if (showPdfModal) {
            handleShowPdfModal();
        }
    }, [showPdfModal, props.auth])

    function onPdfUpload(e) {
        if (roomKey === null) {
            setRoomKey (nanoid());
        }

        if (e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setSelectedFileName(e.target.files[0].name);
            setPdfViewer(<PDFViewer renderFive={true} selectedFile={e.target.files[0]}></PDFViewer>)
            setShowPdfModal(true);    
        }
    }

    function handleShowPdfModal() {
        setShowPdfModal(true);
    }

    function handleClosePdfModal(e, accepted) {
        // event.preventDefault();
        // the error message shows whenever a person uploads any file other than Pdf
        const errorMessage = document.getElementsByClassName('react-pdf__message react-Pdf__message--error') 
        const largePdfMessage = document.getElementsByClassName('too-large-Pdf')
        
        if (accepted && errorMessage.length === 0 && largePdfMessage.length === 0) {
            let canvas  = document.getElementsByClassName("react-pdf__Page__canvas")[0];
            let dataUrl = canvas.toDataURL("image/jpeg");
            let blobData = dataURItoBlob(dataUrl);
            uploadThumbnail(blobData);
            uploadFile().then(res => {
                createRoom();
            });
            
        } else {

            if (errorMessage.length !== 0) {
                onInvalidPdfAlert();
            }

            setSelectedFile(null);
            setSelectedFileName(null);
            setPdfViewer(null);
            setShowPdfModal(false);
            document.getElementById("pdf-file-input").value = "";
        }
    }

    async function uploadFile() {
        let contentType = selectedFile.type;
        const generatePutUrl = `${process.env.REACT_APP_BACKEND_ADDRESS}/api/generate-put-url`;

        let options = {
            params: {
                Key: `${roomKey}.pdf`,
                ContentType: contentType
            },
            headers: {
                'Content-Type': contentType,
            },
        };
        let res = await axios.get(generatePutUrl, options)
            // console.log('AXIOS GET')
        const {
            data: { putURL }
        } = res;

        setShowProgressBar(true);
        //upload file via url that was sent back from the server
        delete axios.defaults.headers.common["Authorization"]

        let res1 = await axios.put(putURL, selectedFile);

        const token = localStorage.getItem("jwtToken");
        axios.defaults.headers.common["Authorization"] = token;

        return res1;

    };

    async function uploadThumbnail(blobData) {
        const contentType = blobData.type; // eg. image/jpeg or image/svg+xml
        const generatePutUrl = `${process.env.REACT_APP_BACKEND_ADDRESS}/api/generate-put-url`;

        let options = {
            params: {
                Key: `${roomKey}.jpeg`,
                ContentType: contentType
            },
            headers: {
                'Content-Type': "image/jpeg",
            },
        };

        let res = await axios.get(generatePutUrl, options)

        const {
        data: { putURL }
        } = res;

        setShowProgressBar(true);
        //upload file via url that was sent back from the server
        delete axios.defaults.headers.common["Authorization"]
        let res1 = await axios.put(putURL, blobData);

        const token = localStorage.getItem("jwtToken")
        axios.defaults.headers.common["Authorization"] = token;

        return res1;

    }

    function onInvalidPdfAlert() {
        setInvalidPdfAlertVisible(true);
        window.setTimeout(() => {
            setInvalidPdfAlertVisible(false)
        }, 5000)
    }

    function dataURItoBlob(dataURI) {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for(var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
    }

    function createRoom() {
        const createRoomUrl = `${process.env.REACT_APP_BACKEND_ADDRESS}/api/create-room`;
        axios.post(createRoomUrl, {roomCode: roomKey, userId: props.auth.user.id, fileName: selectedFileName}).then(res => {
            setShowPdfModal(false);
            setShowProgressBar(false);
            props.history.push({
                pathname: `/collab`,
                search: `?username=${props.auth.user.name}&roomCode=${roomKey}&action=create`,
                state: {id: props.auth.user.id},
            })
        })
        
    }

    return (
        <div className='documents-shared-file'>
            <div className='documents-create-new'>
                <label htmlFor="pdf-file-input" className='documents-create-new-button custom-file-upload'>
                <div className='button-circle-layer'></div>
                    <img src={addImg}/>
                </label>
                <input id="pdf-file-input" type="file" name="file" onChange={onPdfUpload}/>
            </div>              
            <Modal show={showPdfModal} onHide={(event) => handleClosePdfModal(event, false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedFileName} (preview)</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-body'>
                    {showProgressBar ? 
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
                    pdfViewer}
                </Modal.Body>
                <Modal.Footer>
                {showProgressBar ? null :
                    <Button variant="primary" onClick={(event) => handleClosePdfModal(event, true)}>
                        Okay
                    </Button>}
                </Modal.Footer>
            </Modal>
            <Alert variant='danger' show={invalidPdfAlertVisible}>
                Make sure the provided file is a Pdf document.
            </Alert>
        </div>
    );

}

CreateDocument.propTypes = {
        auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth    
});

export default withRouter(connect(mapStateToProps)(CreateDocument))