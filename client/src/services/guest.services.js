import axios from 'axios'

const getHeaders = {
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': '*',
}

class GuestService {
    async validateInvitationCode(roomCode, invitationCode) {
        const options = {
            params: {
                roomCode: roomCode,
                invitationCode, invitationCode
            },
            headers: getHeaders
        }

        const res = await axios.get(
            `${process.env.REACT_APP_BACKEND_ADDRESS}/api/guests/validate-invitation-code`,
            options
        )
        return res.data.validCode
    }
}

export default new GuestService