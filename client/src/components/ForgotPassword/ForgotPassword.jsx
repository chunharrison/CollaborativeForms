import React, { useState } from "react";
import axios from "axios";
import { connect } from 'react-redux';

import backgroundImg from './background.png';

const ForgotPassword = (props) => {

    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    //send get request to server to which email to send reset instructions to
    function resetPassword() {   
        setLoading(true);
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
        axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/users/forgot-password`, options).then(res => {
            setSent(true);
            setMessage('Email with instructions has been sent to the address entered above');
            setLoading(false);
        }).catch(function (error) {
            setLoading(false);
            if (error.response) {
                if (error.response.data.email) {
                    setMessage(error.response.data.email);

                } else {
                    setMessage(error.response.data);                    
                }
                setSent(true)            }
        });
}

    return (
        <div className="login-container">
            <div className='signin-form'>
                <p className='login-logo'>cosign</p>
                <p className='login-header'>Forgot Password</p>
                <div className='login-input-container'>
                    <input placeholder='Email' className='login-input' onChange={(e) => setEmail(e.target.value)} type="text"/>
                </div>
                <button
                onClick={() => resetPassword()}
                className="signin-button login-button">
                    {loading ? <div className='spinner'></div> : 'Reset Password'}
                </button>
                {!sent ? '' : <p className='forgot-password-message'>{message}</p>}
            </div>
            <img className='login-abstract1' src={backgroundImg}></img>
        </div>
    )
}


const mapStateToProps = state => ({
    errors: state.errors    
});

export default connect(
    mapStateToProps,
)(ForgotPassword);