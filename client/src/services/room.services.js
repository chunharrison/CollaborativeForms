import axios from 'axios'

const getHeaders = {
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': '*',
}

const postHeaders = {
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': '*',
}

class RoomService {
    sendMessage(email, subject, message) {
        return axios.post('/api/emails/send-message', {email: email, subject: subject, message: message});
    }

    bugReport(email, subject, message) {
        return axios.post('/api/emails/bug-report', {email: email, subject: subject, message: message})
    }

    getGuests() {
        const options = {}
        axios.get('/api/guests/get-guests', options).then(res => {
            return res.guests
        })
    }
}

export default new RoomService();