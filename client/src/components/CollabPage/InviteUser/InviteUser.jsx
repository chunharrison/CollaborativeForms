import React from 'react'

// Redux
import { connect } from 'react-redux' 
import { 
    setInvitationLink,
    openInviteGuestsWindow,
    openInviteGuestsAlert 
} from '../../../actions/roomActions'

// Services
import RoomService from '../../../services/room.services'

// Libraries
import axios from 'axios';
import { nanoid } from 'nanoid'

// Images
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
                const invitationCode = nanoid()
                RoomService.setRoomInvitationCode(props.roomCode, invitationCode)
                invitationLink = `${process.env.REACT_APP_FRONTEND_ADDRESS}/join-room?roomCode=${props.roomCode}&invitationCode=${invitationCode}`
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