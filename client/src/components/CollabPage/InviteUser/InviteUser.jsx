import React, {useState} from 'react'

import { connect } from 'react-redux' 
// import { nanoid } from 'nanoid'

import { 
    setInvitationLink,
    openInviteGuestsWindow 
} from '../../../actions/roomActions'

// Components
// import Button from 'react-bootstrap/Button'; // open source
import axios from 'axios';
import { nanoid } from 'nanoid'

// IMAGE
import theking from './theking.jpg'

const InviteUser = (props) => {

    const [guestieID, setGuestieID] = useState('')

    function onInviteClick() {
        const getGuestSpaceIdURL = `${process.env.REACT_APP_BACKEND_ADDRESS}/api/get-guest-space-id`;
        const options = {
            params: {
                roomCode: props.roomCode
            },
            headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': '*',
            },
        };
        // console.log(props.roomCode)
        axios.get(getGuestSpaceIdURL, options).then(res => {
            console.log(res.data.full)
            if (!res.data.full) {
                // setGuestieID(nanoid())
                console.log(nanoid())
            }
            // const invitationLink = `${process.env.REACT_APP_BACKEND_ADDRESS}/collab?userName${res.data.openedSpaceID}`
            const invitationLink = `http://localhost:3000/join-room?roomCode=${props.roomCode}&guestID=${nanoid()}`
            console.log(invitationLink)
            props.setInvitationLink(invitationLink)
            props.openInviteGuestsWindow()
        });
    }

    return (
        <div>
            <img className='theking' src={theking} onClick={() => onInviteClick()}></img>
        </div>
    )
}

const mapStateToProps = state => ({
    roomCode: state.room.roomCode
})

export default connect(mapStateToProps, {
    setInvitationLink,
    openInviteGuestsWindow
})(InviteUser)