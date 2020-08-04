import React, { useEffect, useState } from 'react'

// Redux
import { connect } from 'react-redux';
import { 
    setPMState,
    closePMWaitWindow 
} from '../../../actions/pilotActions'
 
// Components
import Button from 'react-bootstrap/Button'; // open source
import Modal from 'react-bootstrap/Modal'; // open source
import { 
    TacoTable, 
    DataType,
} from 'react-taco-table'; // open source

// Libraries
import axios from 'axios'

import closeImg from './close.png';

const PMWaitWindow = (props) => {

    const [socketUpdated, setSocketUpdated] = useState(false)

    let pmNumAccepts = 0

    const pmWaitColumns = [
        {
            id: 'user',
            type: DataType.String,
            header: 'User',
        },
        {
            id: 'status',
            type: DataType.String,
            header: 'Status',
            tdStyle(cellData) {
                if (cellData === "Pending") {
                    return { color: '#CCCC00' };
                } else if (cellData === "Accepted") {
                    return { color: 'green' };
                } else if (cellData === "Declined") {
                    return { color: '#DC143C' };
                }

                return undefined;
            }
        }
    ]
    
    function handleClosePilotWaitingModal(event) {
        event.preventDefault()
        props.closePMWaitWindow()
    }

    return (
        <div>
            <Modal className='pilot-modal-dialog' show={props.pilot.pmShowWaitWindow} backdrop="static">
                <Modal.Header className='pilot-modal-header'>
                    <Modal.Title>Waiting for Guests</Modal.Title>
                    <button className='account-modal-button' onClick={(event) => handleClosePilotWaitingModal(event)}>
                        <img src={closeImg} className='modal-img'/>
                    </button>
                </Modal.Header>
                <Modal.Body className='pilot-modal-body'>
                    <TacoTable
                        className="pilot-mode-modal-table"
                        columns={pmWaitColumns}
                        columnHighlighting
                        data={props.pilot.pmWaitWindowTableRows}
                        striped
                        sortable
                    />
                </Modal.Body>
            </Modal>
        </div>
    )
}


const mapStateToProps = state => ({
    // room
    room: state.room,

    // doc
    canvasContainerRef: state.doc.canvasContainerRef,

    // pilot
    pilot: state.pilot
})

export default connect(mapStateToProps ,{
    setPMState,
    closePMWaitWindow
})(PMWaitWindow);