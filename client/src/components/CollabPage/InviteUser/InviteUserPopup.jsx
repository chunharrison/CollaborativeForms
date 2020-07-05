import React from 'react'
import { connect } from 'react-redux'
import {CopyToClipboard} from 'react-copy-to-clipboard';
// Components
import Button from 'react-bootstrap/Button'; // open source
import Modal from 'react-bootstrap/Modal'; // open source

const InviteUserPopup = (props) => {

    // React.useEffect(() => {
    //     console.log(props.showInviteGuestsModal)
    // })

    return(
        <Modal show={props.showInviteGuestsModal}>
            <Modal.Header>
                <Modal.Title>Invite Others</Modal.Title>
            </Modal.Header>
            <Modal.Body className='modal-body'>
                <h3>
                    {props.invitationLink}
                </h3>
            </Modal.Body>
            <Modal.Footer>
                <CopyToClipboard text={props.invitationLink}>
                    <Button>Copy</Button>
                </CopyToClipboard>
            </Modal.Footer>
        </ Modal>
    )
}

const mapStateToProps = state => ({
    showInviteGuestsModal: state.room.showInviteGuestsModal,
    invitationLink: state.room.invitationLink
})

export default connect(mapStateToProps)(InviteUserPopup)