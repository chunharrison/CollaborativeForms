import axios from 'axios'

const getHeaders = {
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': '*',
}

class RoomService {
    setRoomInvitationCode(roomCode, invitationCode) {
        axios.post(
            `${process.env.REACT_APP_BACKEND_ADDRESS}/api/room/set-room-invitation-code`, 
            {roomCode: roomCode, invitationCode: invitationCode}
        )
    }
}

export default new RoomService();