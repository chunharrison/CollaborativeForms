import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
// import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../../actions/authActions";
import { setError }from "../../actions/errorActions"
import classnames from "classnames";

import { nanoid } from 'nanoid';

// 
import UserService from '../../services/user.services';
import EmailService from '../../services/email.services';

import backgroundImg from './background.png';
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
        UserService.createEmailVerificationEntry(key, newUser)
            .then(res => {
                this.setState({loading: false});
                console.log('createEmailVerificationEntry DONE')
                EmailService.sendVerificationEmail(key, this.state.email, process.env.REACT_APP_FRONTEND_ADDRESS)
                    .then(res => {
                        console.log('sendVerificationEmail DONE')
                        const container = document.getElementById('sign-in-out-form-container');
                        if (container) container.classList.remove("right-panel-active")
                    })
            })
            .catch(err => {
                this.setState({loading: false});
                console.log('createEmailVerificationEntry FAILED')
                // this.props.setError(err.response.data)
            })
    };

    render() {
        const { errors } = this.state;

    return (
            <div className="register-container">
                <img className='sign-in-out-abstract1' src={backgroundImg}></img>
                <form noValidate onSubmit={this.onSubmit} id='register' className="register-form">
                    <p className='register-logo'>cosign</p>
                    <p className="register-header">Create your account</p>
                    
                    <div className="register-input-container">
                        <input
                            onChange={this.onChange}
                            value={this.state.name}
                            error={errors.name}
                            id="name"
                            type="text"
                            placeholder="Name"
                            className={classnames("register-input", {
                                invalid: errors.name
                            })}
                        />
                        <span className="red-text">{errors.name}</span>
                    </div>

                    <div className="register-input-container">
                        <input
                            onChange={this.onChange}
                            value={this.state.email}
                            error={errors.email}
                            id="email"
                            type="email"
                            placeholder="Email"
                            className={classnames("register-input", {
                                invalid: errors.email
                            })}
                        />
                        <span className="red-text">{errors.email}</span>
                    </div>

                    <div className="register-input-container">
                        <input
                            onChange={this.onChange}
                            value={this.state.password}
                            error={errors.password}
                            id="password"
                            type="password"
                            placeholder="Password"
                            className={classnames("register-input", {
                                invalid: errors.password
                            })}
                        />
                        <span className="red-text">{errors.password}</span>
                    </div>
                    <div className="register-input-container">
                        <input
                            onChange={this.onChange}
                            value={this.state.password2}
                            error={errors.password2}
                            id="password2"
                            type="password"
                            placeholder="Confirm Password"
                            className={classnames("register-input", {
                                invalid: errors.password2
                            })}
                        />
                    <span className="red-text">{errors.password2}</span>
                    </div>
                    <button
                        type="submit"
                        className="signup-button register-button"
                    >
                        {this.state.loading ? <div className='spinner'></div> : 'Sign up'}
                    </button>
                    <p type='button'className='login-redirect'>Already a member? <span className='login-redirect-highlight' onClick={() => {this.props.history.push("/login")}}>Log in</span></p>
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