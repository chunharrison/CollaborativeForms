import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../../actions/authActions";
import classnames from "classnames";

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

    componentDidMount() {
        // If logged in and user navigates to Register page, should redirect them to {page}
        if (this.props.auth.isAuthenticated) {
            this.props.history.push("/");
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
        this.props.registerUser(newUser, this.props.history); 
    };

    render() {
        const { errors } = this.state;

    return (
            <div className="register-form-container">
                <form noValidate onSubmit={this.onSubmit} className="register-form">
                    <h1 className="register-header">Create Account</h1>
                    <div className="input-field col-register">
                        <input
                            onChange={this.onChange}
                            value={this.state.name}
                            error={errors.name}
                            id="name"
                            type="text"
                            placeholder="Name"
                            className={classnames("login-register-input", {
                                invalid: errors.name
                            })}
                        />
                        <span className="red-text">{errors.name}</span>
                    </div>

                    <div className="input-field col-register">
                        <input
                            onChange={this.onChange}
                            value={this.state.email}
                            error={errors.email}
                            id="email"
                            type="email"
                            placeholder="Email"
                            className={classnames("login-register-input", {
                                invalid: errors.email
                            })}
                        />
                        <span className="red-text">{errors.email}</span>
                    </div>

                    <div className="input-field col-register">
                        <input
                            onChange={this.onChange}
                            value={this.state.password}
                            error={errors.password}
                            id="password"
                            type="password"
                            placeholder="Password"
                            className={classnames("login-register-input", {
                                invalid: errors.password
                            })}
                        />
                        <span className="red-text">{errors.password}</span>
                    </div>
                    <div className="input-field col-register">
                        <input
                            onChange={this.onChange}
                            value={this.state.password2}
                            error={errors.password2}
                            id="password2"
                            type="password"
                            placeholder="Confirm Password"
                            className={classnames("login-register-input", {
                                invalid: errors.password2
                            })}
                        />
                    <span className="red-text">{errors.password2}</span>
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

Register.propTypes = {
    registerUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { registerUser }
)(withRouter(Register));