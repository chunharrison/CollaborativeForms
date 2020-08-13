import React from 'react'

const RegisterRedirect = (props) => {
    function handleLoginButtonClick(e) {
        e.preventDefault()

        props.history.push('/account')
    }

    
    return (
        <div className="verify-email-container">
            <h1>Thank you for signing up!</h1>
            <h2>A verification e-mail has been sent to: {props.emailAddress}.</h2>
            <h2>Check your inbox for the verfication link, entering will finish the signup process.</h2>
            <button className="login-register-button" onClick={e => handleLoginButtonClick(e)}>LOGIN</button>
        </div>
    )
}

export default RegisterRedirect