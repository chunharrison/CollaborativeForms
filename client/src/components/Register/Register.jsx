import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
// import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../../actions/authActions";
import { setError }from "../../actions/errorActions"
import classnames from "classnames";
import axios from 'axios'
import { nanoid } from 'nanoid';

// 
import UserService from '../../services/user.services';
import EmailService from '../../services/email.services';

import backgroundImg from './background.png';
import alertImg from './alert.png';

// CSS 
import './css/Register.css';

class Register extends Component {
    constructor() {
        super();
        this.state = {
            name: "",
            email: "",
            password: "",
            password2: "",
            errors: {},
            loading: false,
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
        this.setState({loading: true});
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
                this.setState({loading: false});
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
                this.setState({loading: false});
                this.props.setError(err.response.data)
            })
    };

    render() {
        const { errors } = this.state;

    return (
            <div className="register-container">
                <form noValidate onSubmit={this.onSubmit} id='register' className="register-form">
                    <p className='register-logo'>cosign</p>
                    <p className="register-header">Create your account</p>
                    
                        <input
                            onChange={this.onChange}
                            value={this.state.name}
                            error={errors.nameRegister}
                            id="name"
                            type="text"
                            placeholder="Name"
                            className={classnames("register-input", {
                                invalid: errors.nameRegister
                            })}
                            style={{'margin-bottom': `${errors.nameRegister ? '' : '1em'}`}}
                        />
                        <div className='alert-module' style={{'display': `${errors.nameRegister ? '' : 'none'}`}}>
                            <img src={alertImg} className='alert-image'/>
                            <span className="red-text">
                                {errors.nameRegister}
                            </span>
                        </div>

                        <input
                            onChange={this.onChange}
                            value={this.state.email}
                            error={errors.emailRegister}
                            id="email"
                            type="email"
                            placeholder="Email"
                            className={classnames("register-input", {
                                invalid: errors.emailRegister
                            })}
                            style={{'margin-bottom': `${errors.emailRegister ? '' : '1em'}`}}
                        />
                        <div className='alert-module' style={{'display': `${errors.emailRegister ? '' : 'none'}`}}>
                            <img src={alertImg} className='alert-image'/>
                            <span className="red-text">
                                {errors.emailRegister}
                            </span>
                        </div>
                        <input
                            onChange={this.onChange}
                            value={this.state.password}
                            error={errors.passwordRegister}
                            id="password"
                            type="password"
                            placeholder="Password"
                            className={classnames("register-input", {
                                invalid: errors.passwordRegister
                            })}
                            style={{'margin-bottom': `${errors.passwordRegister ? '' : '1em'}`}}
                        />
                        <div className='alert-module' style={{'display': `${errors.passwordRegister ? '' : 'none'}`}}>
                            <img src={alertImg} className='alert-image'/>
                            <span className="red-text">
                                {errors.passwordRegister}
                            </span>
                        </div>
                        <input
                            onChange={this.onChange}
                            value={this.state.password2}
                            error={errors.password2Register}
                            id="password2"
                            type="password"
                            placeholder="Confirm Password"
                            className={classnames("register-input", {
                                invalid: errors.password2Register
                            })}
                            style={{'margin-bottom': `${errors.password2Register ? '' : '1em'}`}}
                        />
                        <div className='alert-module' style={{'display': `${errors.password2Register ? '' : 'none'}`}}>
                            <img src={alertImg} className='alert-image'/>
                            <span className="red-text">
                                {errors.password2Register}
                            </span>
                        </div>
                    <button
                        type="submit"
                        className="signup-button register-button"
                    >
                        {this.state.loading ? <div className='spinner'></div> : 'Sign up'}
                    </button>
                    <p type='button'className='login-redirect'>Already a member? <span className='login-redirect-highlight' onClick={() => {this.props.history.push("/login")}}>Log in</span></p>
                </form>
                <img className='register-abstract1' src={backgroundImg}></img>

                <div className="social-media-buttons">
                    <a 
                        href={`${process.env.REACT_APP_BACKEND_ADDRESS}/auth/google`}
                        onClick={e => this.registerWithGoogle(e)}
                        class="test-a">
                        <div>
                            <span class="test-svgIcon t-popup-svg">
                                <svg
                                    class="svgIcon-use"
                                    width="25"
                                    height="37"
                                    viewBox="0 0 25 25">
                                    <g fill="none" fill-rule="evenodd">
                                    <path
                                        d="M20.66 12.693c0-.603-.054-1.182-.155-1.738H12.5v3.287h4.575a3.91 3.91 0 0 1-1.697 2.566v2.133h2.747c1.608-1.48 2.535-3.65 2.535-6.24z"
                                        fill="#4285F4"/>
                                    <path
                                        d="M12.5 21c2.295 0 4.22-.76 5.625-2.06l-2.747-2.132c-.76.51-1.734.81-2.878.81-2.214 0-4.088-1.494-4.756-3.503h-2.84v2.202A8.498 8.498 0 0 0 12.5 21z"
                                        fill="#34A853"/>
                                    <path
                                        d="M7.744 14.115c-.17-.51-.267-1.055-.267-1.615s.097-1.105.267-1.615V8.683h-2.84A8.488 8.488 0 0 0 4 12.5c0 1.372.328 2.67.904 3.817l2.84-2.202z"
                                        fill="#FBBC05"/>
                                    <path
                                        d="M12.5 7.38c1.248 0 2.368.43 3.25 1.272l2.437-2.438C16.715 4.842 14.79 4 12.5 4a8.497 8.497 0 0 0-7.596 4.683l2.84 2.202c.668-2.01 2.542-3.504 4.756-3.504z"
                                        fill="#EA4335"/>
                                    </g>
                                </svg>
                            </span>
                        <span class="button-label">Continue with Google</span>
                    </div>
                    </a>
                </div>
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