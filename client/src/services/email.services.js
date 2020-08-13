import axios from 'axios'

class EmailService {
    sendVerificationEmail(key, email, frontendAddress) {
        return axios.post(
            `${process.env.REACT_APP_BACKEND_ADDRESS}/api/emails/send-verification-email`,
            {key: key, email: email, frontendAddress: frontendAddress}
        )
    }
}

export default new EmailService()