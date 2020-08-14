import React, {useState, useRef} from 'react'

import UserService from '../../services/user.services'

import './VerifyEmail.css'

const VerifyEmail = (props) => {
    const [callsMade, setCallsMade] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')
    const [successful, setSuccessful] = useState(false)

    useState(() => {
        if (!callsMade) {

            const key = props.location.pathname.split('/')[2]
            UserService.verifyEmail(key)
                .then(res => {
                    console.log('success')
                    setStatusMessage('Email Verification Successful! Welcome to Cosign')
                    setSuccessful(true)
                })
                .catch(err => {
                    console.log('fail')
                    setStatusMessage("Link has expired or is invalid")
                })
            setCallsMade(true)
        }
    })

    function handleLoginButtonClick(e) {
        e.preventDefault()

        props.history.push('/account')
    }

    return (
        <div>
            {
                callsMade
                ?
                <div className="verify-email-container">
                    {statusMessage}
                    {
                        successful
                        ?
                        <button className="login-register-button" onClick={e => handleLoginButtonClick(e)}>LOGIN</button>
                        :
                        null
                    }
                </div>
                :
                <div className="loader-wrapper">
                    <span className="circle circle-1"></span>
                    <span className="circle circle-2"></span>
                    <span className="circle circle-3"></span>
                    <span className="circle circle-4"></span>
                    <span className="circle circle-5"></span>
                    <span className="circle circle-6"></span>
                </div>
            }
        </div>
    )
}

export default VerifyEmail