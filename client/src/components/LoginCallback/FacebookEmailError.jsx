import React from 'react'

const FacebookEmailError = props => {
    function handleButtonClick(e) {
        e.preventDefault()

        props.history.push('/')
    }
    return (
        <div className="verify-email-container">
            <h1>There is no email address associated with this Facebook account</h1>
            <h1>Try logging-in / registering some other way</h1>
            <button className="login-register-button" onClick={e => handleButtonClick(e)}>Return</button>
        </div>
    )
}

export default FacebookEmailError