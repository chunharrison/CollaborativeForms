import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import './ResetPassword.css'

const ResetPassword = (props) => {

    const [password, setPassword] = useState(null);
    const [confirmedPassword, setConfirmedPassword] = useState(null)
    const [submitted, setSubmitted] = useState(false);

  function updatePassword(e) {
    e.preventDefault()
    const userId  = props.location.pathname.split('/')[2];
    const token = props.location.pathname.split('/')[3];
    axios
        .post(
        '/api/users/new-password',
        {
            userId: userId, 
            token: token, 
            password: password 
        }
        )
        .then(res => console.log("RESPONSE FROM SERVER TO CLIENT:", res))
        .catch(err => console.log("SERVER ERROR TO CLIENT:", err))
    setSubmitted(!submitted);
    }

    return (
        <div className='sign-in-out-background'>
            <div className='sign-in-out-abstract1'>

            </div>
            <div className='sign-in-out-abstract2'>

            </div>
            <div className="reset-password-container fade-in">
            <p className='reset-password-header'>Update your password</p>
            {submitted ? (
                <div className="reset-password-form-sent-wrapper">
                    <p>Your password has been saved.</p>
                    <Link to="/account" className="ghost-btn">
                        Sign back in
                    </Link>
                </div>
            ) : (
                <form
                    onSubmit={updatePassword}
                    style={{ paddingBottom: "1.5rem" }}
                    className='reset-password-form'
                >
                    <input
                    className='reset-password-input'
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    placeholder="New password"
                    type="password"
                    />
                    <input
                    className='reset-password-input'
                    onChange={(e) => setConfirmedPassword(e.target.value)}
                    value={confirmedPassword}
                    placeholder="Confirm password"
                    type="password"
                    />
                    <button className="signin-button login-register-button">
                    Update password
                    </button>
                </form>
            )}
        </div>

        </div>
    )
}
ResetPassword.propTypes = {
  token: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired
}
export default ResetPassword