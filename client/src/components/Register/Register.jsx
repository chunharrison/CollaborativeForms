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
            registered: false
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
                        this.setState({registered: true})
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
                {
                    this.state.registered
                    ?
                    <div className="register-form callback-container">
                        <p className="register-logo callback-message-welcome callback-message">Welcome {this.state.name}Charlie!</p>
                        <p className="register-logo callback-message-verify callback-message">A verification email has been sent to:</p>
                        <p className="register-logo callback-message-email callback-message">{this.state.email}bad@dog.ca</p>
                    </div>
                    :
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
                }
                {
                    this.state.registered
                    ?
                    null
                    :
                    <div className="after-post register-page">
                        <div class="social-share-holder">
                            <ul class="social-share">		
                            <li>
                                <a
                                href={`${process.env.REACT_APP_BACKEND_ADDRESS}/auth/google`} className="google">
                                <svg 
                                    viewBox="0 0 533.5 544.3" 
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"/>
                                    <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"/>
                                    <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" />
                                    <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" />
                                </svg>
                                </a>
                            </li>
                            <li>
                                <a
                                href={`${process.env.REACT_APP_BACKEND_ADDRESS}/auth/facebook`} className="facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                                </a>
                            </li>
                                
                            <li>
                                <a
                                href={`${process.env.REACT_APP_BACKEND_ADDRESS}/auth/linkedin`} className="linkedin">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>              </a>
                            </li>	
                            </ul>
                        </div>
                    </div>
                }
                <img className='register-abstract1' src={backgroundImg}></img>
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