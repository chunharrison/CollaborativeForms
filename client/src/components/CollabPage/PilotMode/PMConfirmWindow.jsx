import React from 'react'

// Redux
import { connect } from 'react-redux';
import { closePMConfirmWindow } from '../../../actions/pilotActions'

// Components
import Button from 'react-bootstrap/Button'; // open source
import Modal from 'react-bootstrap/Modal'; // open source

import 'react-taco-table/dist/react-taco-table.css';

import closeImg from './close.png';
import tickImg from './tick.png';

const PMConfirmWindow = (props) => {

    function handleClosePMConfirmWindow(event, confirmed) {
        event.preventDefault()

        // redux
        props.closePMConfirmWindow()

        // socket.io
        const callbackData = {
            confirmed: confirmed,
            confirmingUserGuestID: props.guestID,
            requesterSocketID: props.pmRequesterSocketID,
        }

        props.userSocket.emit("pilotModeRequestCallback", callbackData)
    }


    return(
        <div>
            <Modal className='pilot-modal-dialog' show={props.pmShowConfirmWindow} backdrop="static">
                <Modal.Header className='pilot-modal-header'>
                    <Modal.Title>Pilot Mode Requested</Modal.Title>
                    <div>
                        <button className='account-modal-button' onClick={(event) => handleClosePMConfirmWindow(event, true)}>
                            <img src={tickImg} className='modal-img'/>
                        </button>
                        <button className='account-modal-button' onClick={(event) => handleClosePMConfirmWindow(event, false)}>
                            <img src={closeImg} className='modal-img-close'/>
                        </button>
                    </div>
                </Modal.Header>
                <Modal.Body className='pilot-confirm-modal-body'>
                    <p>{props.pmRequesterUsername} has requested to be in charge of navigating through the document.</p>
                </Modal.Body>
            </Modal>
        </div>
    )
}


const mapStateToProps = state => ({
    // room
    userName: state.room.userName,
    userSocket: state.room.userSocket,
    guestID: state.room.guestID,

    pmShowConfirmWindow: state.pilot.pmShowConfirmWindow,
    pmRequesterUsername: state.pilot.pmRequesterUsername,
    pmRequesterSocketID: state.pilot.pmRequesterSocketID,
    pmCurrNumGuests: state.pilot.pmCurrNumGuests,
})

export default connect(mapStateToProps ,{
    closePMConfirmWindow
})(PMConfirmWindow);
