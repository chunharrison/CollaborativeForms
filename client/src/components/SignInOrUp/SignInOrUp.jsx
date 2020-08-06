import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import Register from "../Register/Register"
import Login from "../Login/Login"
import ForgotPassword from '../ForgotPassword/ForgotPassword'
// redux 
import { connect } from 'react-redux'

import './css/SignInOrUp.css'

class SignInOrUp extends Component {
    constructor(props) {
        super(props)

        this.state = {
            forgot: false,
            shrink: false,
        }

        this.setForgot = this.setForgot.bind(this);

    }

    setForgot() {
        this.setState({forgot: !this.state.forgot}); 
    }

    onSignUpPanelClick(e) {
        e.preventDefault()

        const container = document.getElementById('sign-in-out-form-container');
        container.classList.add("right-panel-active")
    }

    onSignInPanelClick(e) {
        e.preventDefault()

        const container = document.getElementById('sign-in-out-form-container');
        container.classList.remove("right-panel-active")
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuthenticated) {
          this.props.history.push("/account-portal"); // push user to {page} when they login
        }
    }

    componentDidMount() {
        // If logged in and user navigates to Login page, should redirect them to {page}
        if (this.props.auth.isAuthenticated) {
          this.props.history.push("/account-portal");
        }

        if (localStorage.getItem('signup') === 'true') {
            const container = document.getElementById('sign-in-out-form-container');
            container.classList.add("right-panel-active")
            localStorage.removeItem('signup')
        }
      }

    render() {
        return (
            <div className='sign-in-out-background'>
                <div className='sign-in-out-abstract1'>

                </div>
                <div className='sign-in-out-abstract2'>

                </div>
                {!this.state.forgot ? 
                <div id="sign-in-out-form-container" className={`sign-in-out-form-container`}>
                    <Register/>
                    <Login
                    setForgot={this.setForgot}
                    />
                    <div className="overlay-container">
                        <div className="overlay">
                            <div className="overlay-panel overlay-left">
                                <h1>Welcome Back!</h1>
                                <p className="panel-description">Sign in to your account</p>
                                <button className="ghost login-register-button" id="signIn" onClick={e => this.onSignInPanelClick(e)}>Sign In</button>
                            </div>
                            <div className="overlay-panel overlay-right">
                                <h1>Hello, Friend!</h1>
                                <p className="panel-description">Create an account</p>
                                <button className="ghost login-register-button" id="signUp" onClick={e => this.onSignUpPanelClick(e)}>Sign Up</button>
                            </div>
                        </div>
                    </div>
                </div>
                :
                <ForgotPassword/>
                }
                
            </div>
        )
    }
}

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(
    mapStateToProps
)(withRouter(SignInOrUp))