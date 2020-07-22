import axios from 'axios'

class EmailService {
    sendMessage(email, subject, message) {
        return axios.post('/api/emails/send-message', {email: email, subject: subject, message: message});
    }

    bugReport(email, subject, message) {
        return axios.post('/api/emails/bug-report', {email: email, subject: subject, message: message})
    }
}

export default new EmailService();