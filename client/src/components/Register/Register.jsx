import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
// import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../../actions/authActions";
import { setError }from "../../actions/errorActions"
import classnames from "classnames";

import { nanoid } from 'nanoid'

// 
import UserService from '../../services/user.services'
import EmailService from '../../services/email.services'

// CSS 
import './css/Register.css'

class Register extends Component {
    constructor() {
        super();
        this.state = {
            name: "",
            email: "",
            password: "",
            password2: "",
            errors: {}
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.errors) {
          this.setState({
            errors: nextProps.errors
          });
        }
    }

    onChange = e => {
        this.setState({ [e.target.id]: e.target.value });
    };

    onSubmit = e => {
        e.preventDefault();
        const newUser = {
                name: this.state.name,
                email: this.state.email,
                password: this.state.password,
                password2: this.state.password2
            };
        // this.props.registerUser(newUser, this.props.history); 
        const key = nanoid()

        // Save the entry to the database
        UserService.createEmailVerificationEntry(key, newUser)
            .then(res => {
                // console.log('createEmailVerificationEntry DONE')

                // Send the verification email
                EmailService.sendVerificationEmail(key, this.state.email, process.env.REACT_APP_FRONTEND_ADDRESS)
                    .then(res => {
                        // console.log('sendVerificationEmail DONE')
                        
                        // move the panel to the right
                        const container = document.getElementById('sign-in-out-form-container');
                        if (container) container.classList.remove("right-panel-active")
                    })

                // clear error messages
                const clearErrors = {
                    nameRegister: '',
                    emailRegister: '',
                    passwordRegister: '',
                    password2Register: ''
                }
                this.props.setError(clearErrors)
            })
            .catch(err => {
                // console.log('createEmailVerificationEntry FAILED')
                // console.log(err.response)
                this.props.setError(err.response.data)
            })
    };

    render() {
        const { errors } = this.state;

    return (
            <div className="register-form-container">
                <form noValidate onSubmit={this.onSubmit} id='register' className="register-form">

                    <h1 className="register-header">Create your account</h1>
                    
                    <div className="login-register-input-container">
                        <input
                            onChange={this.onChange}
                            value={this.state.name}
                            error={errors.nameRegister}
                            id="name"
                            type="text"
                            placeholder="Name"
                            className={classnames("login-register-input", {
                                invalid: errors.nameRegister
                            })}
                        />
                        <span className="red-text">{errors.nameRegister}</span>
                    </div>

                    <div className="login-register-input-container">
                        <input
                            onChange={this.onChange}
                            value={this.state.email}
                            error={errors.emailRegister}
                            id="email"
                            type="email"
                            placeholder="Email"
                            className={classnames("login-register-input", {
                                invalid: errors.emailRegister
                            })}
                        />
                        <span className="red-text">{errors.emailRegister}</span>
                    </div>

                    <div className="login-register-input-container">
                        <input
                            onChange={this.onChange}
                            value={this.state.password}
                            error={errors.passwordRegister}
                            id="password"
                            type="password"
                            placeholder="Password"
                            className={classnames("login-register-input", {
                                invalid: errors.passwordRegister
                            })}
                        />
                        <span className="red-text">{errors.passwordRegister}</span>
                    </div>
                    <div className="login-register-input-container">
                        <input
                            onChange={this.onChange}
                            value={this.state.password2}
                            error={errors.password2Register}
                            id="password2"
                            type="password"
                            placeholder="Confirm Password"
                            className={classnames("login-register-input", {
                                invalid: errors.password2Register
                            })}
                        />
                    <span className="red-text">{errors.password2Register}</span>
                    </div>
                    <button
                        type="submit"
                        className="signup-button login-register-button"
                    >
                        Sign up
                    </button>
                </form>
            </div>
        );
    }
}

// Register.propTypes = {
//     registerUser: PropTypes.func.isRequired,
//     auth: PropTypes.object.isRequired,
//     errors: PropTypes.object.isRequired
// };

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { registerUser,
        setError }
)(withRouter(Register));