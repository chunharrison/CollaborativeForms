import React from 'react'

// Redux
import { connect } from 'react-redux';
import { closePMConfirmWindow } from '../../../actions/pilotActions'

// Components
import Button from 'react-bootstrap/Button'; // open source
import Modal from 'react-bootstrap/Modal'; // open source


import 'react-taco-table/dist/react-taco-table.css';

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
            <Modal show={props.pmShowConfirmWindow} backdrop="static">
                <Modal.Header>
                    <Modal.Title>Pilot Mode Requested</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-body'>
                    <p>{props.pmRequesterUsername} has requested to be in charge of navigating through the document.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={(event) => handleClosePMConfirmWindow(event, true)}>
                        Confirm
                    </Button>
                    <Button variant="danger" onClick={(event) => handleClosePMConfirmWindow(event, false)}>
                        Deny
                    </Button>
                </Modal.Footer>
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
