import axios from 'axios'

class UserService {
    createEmailVerificationEntry(key, userData) {
        return axios.post(
            `${process.env.REACT_APP_BACKEND_ADDRESS}/api/users/create-email-verification-entry`, 
            {key: key, userData: userData}
        )
    }

    verifyEmail(key) {
        console.log('verifyEmail')
        return axios.post(
            `${process.env.REACT_APP_BACKEND_ADDRESS}/api/users/verify-email`,
            {key: key}
        )
    }
}

export default new UserService()