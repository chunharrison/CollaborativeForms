import React, { useState, useEffect } from 'react';
import {withRouter} from 'react-router-dom';
//Libraries
import { fabric } from 'fabric';
import { nanoid } from 'nanoid';
import { connect } from 'react-redux';
import PropTypes from "prop-types";
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';

import { getMetadata } from '../../PDFManipulation/PDFMetadata';
import { removeFromPDF } from '../../PDFManipulation/RemoveFromPDF';

//components
import PDFViewer from '../PDFViewer/PDFViewer';

import addImg from './add.png';
import tickImg from './tick.png';

const CreateDocument = props => {
    
    const [roomKey, setRoomKey] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState(null);
    const [pdfViewer, setPdfViewer] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [showProgressBar, setShowProgressBar] = useState(false);
    const [invalidPdfAlertVisible, setInvalidPdfAlertVisible] = useState(false);

    //toggle popup
    useEffect(() => {
        if (showPdfModal) {
            handleShowPdfModal();
        }
    }, [showPdfModal, props.auth])

    //upload pdf with roomcode
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

    //start processing pdf once this function is triggered
    function handleClosePdfModal(e, accepted) {
        // event.preventDefault();
        // the error message shows whenever a person uploads any file other than Pdf
        const errorMessage = document.getElementsByClassName('react-pdf__message react-Pdf__message--error') 
        const largePdfMessage = document.getElementsByClassName('too-large-Pdf')
        
        //if no errors
        if (accepted && errorMessage.length === 0 && largePdfMessage.length === 0) {
            let canvas  = document.getElementsByClassName("react-pdf__Page__canvas")[0];
            let dataUrl = canvas.toDataURL("image/jpeg");
            let blobData = dataURItoBlob(dataUrl);
            uploadThumbnail(blobData);
            //check if pdf has metadata, if so get our objects extracted from the pdf and send it off with createRoom() in order to have them moveable in the room, if no metadata just opload pdf
            getMetadata(selectedFile).then((metadata) => {
                if (metadata) {
                    let objectNames = [];

                    metadata.forEach((object) => {
                        objectNames.push(object.split(',')[0])
                    })
                    removeFromPDF(selectedFile, objectNames).then((pdfBlob) => {
                        let fabricObjects = createObjects(metadata);
                        uploadFile(pdfBlob).then(res => {
                            createRoom(fabricObjects);
                        });
                    })
                } else {
                    uploadFile(selectedFile).then(res => {
                        createRoom([]);
                    });
                }
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

    async function uploadFile(pdfFile) {
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

        let res1 = await axios.put(putURL, pdfFile);

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

    //from the metadata, sort out object info and create fabric objects from them
    function createObjects(metadata) {
        let fabricObjects = [];
        metadata.forEach((object) => {
            
            let objectOptions =  '';
            if (object.match(/(.*),!(.*$)/)) {
                objectOptions = object.match(/(.*),!(.*$)/)[1].split(',');
            } else {
                objectOptions = object.split(',');
            }
            
            if (objectOptions[1] === 'rect') {
                let rect = new fabric.Rect({
                    id: nanoid(),
                    left: parseInt(objectOptions[3]),
                    top: parseInt(objectOptions[4]),
                    originX: 'left',
                    originY: 'top',
                    width: parseInt(objectOptions[5]),
                    height: parseInt(objectOptions[6]),
                    angle: 0,
                    opacity: parseInt(objectOptions[8]),
                    fill: `rgb(${objectOptions[7].match(/([0-9]+).([0-9]+).([0-9]+)/)[1]}, ${objectOptions[7].match(/([0-9]+).([0-9]+).([0-9]+)/)[2]}, ${objectOptions[7].match(/([0-9]+).([0-9]+).([0-9]+)/)[3]})`,
                    stroke: `rgb(${objectOptions[9].match(/([0-9]+).([0-9]+).([0-9]+)/)[1]}, ${objectOptions[9].match(/([0-9]+).([0-9]+).([0-9]+)/)[2]}, ${objectOptions[9].match(/([0-9]+).([0-9]+).([0-9]+)/)[3]})`,
                    strokeWidth: parseInt(objectOptions[10]),
                    transparentCorners: false
                });
                fabricObjects.push([JSON.parse(JSON.stringify(rect.toObject(['id']))), objectOptions[2]]);
            } else if (objectOptions[1] === 'path') {
                let path = new fabric.Path(object.match(/(.*),!(.*$)/)[2], {
                    id: nanoid(),
                    left: parseInt(objectOptions[3]),
                    top: parseInt(objectOptions[4]),
                    originX: 'left',
                    originY: 'top',
                    opacity: parseInt(objectOptions[9]),
                    fill: false,
                    stroke: `rgb(${objectOptions[7].match(/([0-9]+).([0-9]+).([0-9]+)/)[1]}, ${objectOptions[7].match(/([0-9]+).([0-9]+).([0-9]+)/)[2]}, ${objectOptions[7].match(/([0-9]+).([0-9]+).([0-9]+)/)[3]})`,
                    strokeWidth: parseInt(objectOptions[8]),
                });

                fabricObjects.push([JSON.parse(JSON.stringify(path.toObject(['id']))), objectOptions[2]]);
            } else if (objectOptions[1] === 'text') {
                let text = new fabric.IText('Insert Text', {
                    fontFamily: 'roboto',
                    fontSize: parseInt(objectOptions[5]),
                    fill: `rgb(${objectOptions[6].match(/([0-9]+).([0-9]+).([0-9]+)/)[1]}, ${objectOptions[6].match(/([0-9]+).([0-9]+).([0-9]+)/)[2]}, ${objectOptions[6].match(/([0-9]+).([0-9]+).([0-9]+)/)[3]})`,
                    opacity: parseInt(objectOptions[7]),
                    left: parseInt(objectOptions[3]),
                    top: parseInt(objectOptions[4]),
                    id: nanoid()
                })
                fabricObjects.push([JSON.parse(JSON.stringify(text.toObject(['id']))), objectOptions[2]]);
            }
        })

        return fabricObjects;
    }

    function createRoom(fabricObjects) {
        const createRoomUrl = `${process.env.REACT_APP_BACKEND_ADDRESS}/api/create-room`;
        axios.post(createRoomUrl, {roomCode: roomKey, userId: props.auth.user.id, userName: props.auth.user.name, fileName: selectedFileName, objects: fabricObjects}).then(res => {
            setShowPdfModal(false);
            setShowProgressBar(false);
            props.history.push({
                pathname: `/collab`,
                search: `?username=${props.auth.user.name}&roomCode=${roomKey}`,
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
            <Modal className='account-modal-dialog' show={showPdfModal} onHide={(event) => handleClosePdfModal(event, false)} size="xl">
                <Modal.Header className='account-modal-header' closeButton>
                    <Modal.Title>{selectedFileName} (preview)</Modal.Title>
                    {showProgressBar ? null :
                    <button className='account-modal-button' onClick={(event) => handleClosePdfModal(event, true)}>
                        <img src={tickImg} className='modal-img'/>
                    </button>}
                </Modal.Header>
                <Modal.Body className='account-modal-body'>
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