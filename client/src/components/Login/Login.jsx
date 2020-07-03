import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser } from "../../actions/authActions";
import classnames from "classnames";

import './css/Login.css'

class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
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
    const userData = {
      email: this.state.email,
      password: this.state.password
    };
    this.props.loginUser(userData); // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
  };

  render() {

    const { errors } = this.state;
  return (
        <div className="signin-form-container">

          <form noValidate onSubmit={this.onSubmit} className="signin-form">

            <h1 className="signin-header">Sign into your account</h1>

            <div className="login-register-input-container">
              <input
                onChange={this.onChange}
                value={this.state.email}
                error={errors.email}
                id="email"
                type="email"
                placeholder="Email"
                className={classnames("login-register-input", {
                  invalid: errors.email || errors.emailnotfound
                })}/>
              <span className="red-text">
                {errors.email}
                {errors.emailnotfound}
              </span>
            </div>

            <div className="login-register-input-container">
              <input
                onChange={this.onChange}
                value={this.state.password}
                error={errors.password}
                id="password"
                type="password"
                placeholder="Password"
                className={classnames("login-register-input", {
                  invalid: errors.password || errors.passwordincorrect
                })}
              />
              <span className="red-text">
              {errors.password}
              {errors.passwordincorrect}
            </span>
            </div>
            
            <a href="#" className="pw-forget">Forgot your password?</a>

            <button
              type="submit"
              className="signin-button login-register-button"
            >
              Login
            </button>

          </form>
        </div>
      );
    }
  }

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { loginUser }
)(Login);