import React, { Component } from 'react'
import axios from 'axios';
import UserService from '../../services/user.services'

import './VerifyEmail.css'

class VerifyEmail extends Component {
    constructor() {
        super();
        this.state = {
            statusMessage: <div className="loader-wrapper">
                    <span className="circle circle-1"></span>
                    <span className="circle circle-2"></span>
                    <span className="circle circle-3"></span>
                    <span className="circle circle-4"></span>
                    <span className="circle circle-5"></span>
                    <span className="circle circle-6"></span>
                </div>,
            button: null,
        };
    }
    componentDidMount() {
        const key = this.props.location.pathname.split('/')[2]
        axios.post(
            `${process.env.REACT_APP_BACKEND_ADDRESS}/api/users/verify-email`,
            {key: key}
        )
            .then(res => {
                console.log('success')
                this.setState({
                    statusMessage: <div className="verify-message-container">
                        <p className="register-logo callback-message">Email Verification Successful!</p>
                        <p className="register-logo callback-message">Welcome to Cosign</p>
                        </div>,
                    button: <p className="login-register-button" onClick={e => this.handleLoginButtonClick(e)}>Login</p>,
                })
            })
            .catch(err => {
                console.log('fail')
                this.setState({
                    statusMessage: <div className="verify-message-container">
                        <p className="register-logo callback-message">Link has expired or is invalid</p>
                    </div>,
                    button: <p className="login-register-button" onClick={e => this.handleGoBackButtonClick(e)}>Go Back</p>,
                })
            })
    }

    handleLoginButtonClick = (e) => {
        e.preventDefault()

        this.props.history.push('/login')
    }

    handleGoBackButtonClick = (e) => {
        e.preventDefault()

        this.props.history.push('/')
    }

    render () {
        return (
            <div className="verify-email-container">
                {this.state.statusMessage}
                {this.state.button}
            </div>
        )
    }
}

export default VerifyEmail