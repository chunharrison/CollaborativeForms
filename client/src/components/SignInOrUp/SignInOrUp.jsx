import React, { Component } from "react";

import Register from "../Register/Register"
import Login from "../Login/Login"

import './css/SignInOrUp.css'

class SignInOrUp extends Component {
    constructor(props) {
        super(props)
    }

    onSignUpPanelClick(e) {
        e.preventDefault()

        const container = document.getElementById('sign-in-out-form-container');
        console.log(container)
        container.classList.add("right-panel-active")
    }

    onSignInPanelClick(e) {
        e.preventDefault()

        const container = document.getElementById('sign-in-out-form-container');
        container.classList.remove("right-panel-active")
    }

    render() {
        return (
            <div id="sign-in-out-form-container" className="sign-in-out-form-container">
                <Register/>
                <Login/>
                <div class="overlay-container">
                    <div class="overlay">
                        <div class="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p className="panel-description">LMAO EZ</p>
                            <button class="ghost login-register-button" id="signIn" onClick={e => this.onSignInPanelClick(e)}>Sign In</button>
                        </div>
                        <div class="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p className="panel-description">LMAO EZ</p>
                            <button class="ghost login-register-button" id="signUp" onClick={e => this.onSignUpPanelClick(e)}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default SignInOrUp