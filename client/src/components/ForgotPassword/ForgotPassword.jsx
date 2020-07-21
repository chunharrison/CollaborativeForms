import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = (props) => {

    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [message, setMessage] = useState('');
    
    function resetPassword() {   
        const options = {
            params: {
                email: email
            },
            headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': '*',
            },
        }     
        axios.get('/api/users/forgot-password', options).then(res => {
            setSent(true);
            setMessage('Email with instructions has been sent to the address entered above')
        }).catch(function (error) {
            if (error.response) {
                setSent(true);
                setMessage(error.response.data);
            }
        });
}

    return (
        <div className="forgot-password-container fade-in">
            <p className='forgot-password-header'>Forgot Password</p>
            <input placeholder='Email...' className='forgot-password-input' onChange={(e) => setEmail(e.target.value)} type="text"/>
            <button
              onClick={() => resetPassword()}
              className="signin-button login-register-button"
            >Reset Password</button>
            {!sent ? '' : <p className='forgot-password-message'>{message}</p>}
        </div>
    )
}

export default ForgotPassword