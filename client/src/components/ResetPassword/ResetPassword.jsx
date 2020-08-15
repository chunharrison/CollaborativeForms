import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import backgroundImg from './background.png';
import alertImg from './alert.png';

import './ResetPassword.css'
import { setError } from "../../actions/errorActions";

const ResetPassword = (props) => {

    const [password, setPassword] = useState(null);
    const [confirmedPassword, setConfirmedPassword] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    //send new password to server with temp token that was made with combining the prev password and its date created
  function updatePassword(e) {
      setErrors({});
      setMessage('')
    e.preventDefault()
    //get userid and token from url query
    const userId  = props.location.pathname.split('/')[2];
    const token = props.location.pathname.split('/')[3];
    axios
        .post(
        `${process.env.REACT_APP_BACKEND_ADDRESS}/api/users/new-password`,
        {
            userId: userId, 
            token: token, 
            password: password,
            password2: confirmedPassword,
        }
        )
        .then((res) => {
            setPassword('');
            setConfirmedPassword('');
            setSubmitted(!submitted)
        })
        .catch(function(error) {
            if (error.response) {
                setErrors(error.response.data);         
            }
        })
    }

    return (
        <div className='login-container'>
            {submitted ? (
                <div className="reset-password-form-sent-wrapper">
                    <p>Your password has been saved.</p>
                    <Link to="/login" className="ghost-btn">
                        Sign back in
                    </Link>
                </div>
            ) : (
                <form
                    onSubmit={updatePassword}
                    style={{ paddingBottom: "1.5rem" }}
                    className='signin-form'
                >
                    <p className='reset-header'>Update your password</p>

                    <input
                    className='login-input'
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    placeholder="New password"
                    type="password"
                    />
                    <div className='alert-module' style={{'display': `${errors.password ? '' : 'none'}`}}>
                        <img src={alertImg} className='alert-image'/>
                        <span className="red-text">{errors.password}</span>
                    </div>
                    <input
                    className='login-input'
                    onChange={(e) => setConfirmedPassword(e.target.value)}
                    value={confirmedPassword}
                    placeholder="Confirm password"
                    type="password"
                    />
                    <div className='alert-module' style={{'display': `${errors.password2 ? '' : 'none'}`}}>
                        <img src={alertImg} className='alert-image'/>
                        <span className="red-text">{errors.password2}</span>
                    </div>

                    <button className="signin-button login-button">
                    Update password
                    </button>
                    <p className='forgot-password-message'>{message}</p>
                </form>
            )}
            <img className='login-abstract1' src={backgroundImg}></img>
        </div>
    )
}
ResetPassword.propTypes = {
  token: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired
}
export default ResetPassword