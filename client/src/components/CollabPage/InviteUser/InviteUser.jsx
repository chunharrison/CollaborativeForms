import React, {useState} from 'react'

import { connect } from 'react-redux' 
// import { nanoid } from 'nanoid'

import { 
    setInvitationLink,
    openInviteGuestsWindow,
    openInviteGuestsAlert 
} from '../../../actions/roomActions'

// Components
// import Button from 'react-bootstrap/Button'; // open source
import axios from 'axios';
import { nanoid } from 'nanoid'

// IMAGE
import linkImg from './link.png'

const InviteUser = (props) => {

    function onInviteClick() {
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

        axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/guests/check-space-availability`, options).then(res => {
            let invitationLink = ''
            if (!res.data.full) {
                console.log(process.env)
                invitationLink = `${process.env.REACT_APP_FRONTEND_ADDRESS}/join-room?roomCode=${props.roomCode}&guestID=${nanoid()}`
                if (props.isDemoPage) {
                    invitationLink += '&type=demo'
                }
                props.openInviteGuestsWindow()
            } else {
                invitationLink = 'You\'ve reached your account\'s guest capacity!'
                // props.openInviteGuestsAlert()

                props.openInviteGuestsWindow()
            }

            props.setInvitationLink(invitationLink)
        });
    }

    return (
        <div className='tool' onClick={() => onInviteClick()}>
            <img className='linkImg' src={linkImg} />
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