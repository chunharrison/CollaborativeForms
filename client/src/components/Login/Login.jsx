import React, { Component } from "react";
// import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser } from "../../actions/authActions";
import classnames from "classnames";

import backgroundImg from './background.png';

import './css/Login.css'

class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      errors: {},
      loading:false,
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
    this.setState({loading:true});
    const userData = {
      email: this.state.email,
      password: this.state.password
    };
    this.props.loginUser(userData); // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
  };

  componentWillReceiveProps(nextProps) {
    this.setState({loading:false});
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push("/account-portal"); // push user to {page} when they login
    }
  }

  componentDidMount() {
    // If logged in and user navigates to Login page, should redirect them to {page}
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/account-portal");
    }
  }

  render() {

    const { errors } = this.state;
  return (
    <div className='login-container'>
      <img className='sign-in-out-abstract1' src={backgroundImg}></img>
        <form noValidate onSubmit={this.onSubmit} className="signin-form" id='login'>
          <p className='login-logo'>cosign</p>
          <p className="login-header">Welcome Back</p>
          <div className="login-input-container">
            <input
              onChange={this.onChange}
              value={this.state.email}
              error={errors.email}
              id="email"
              type="email"
              placeholder="Email"
              className={classnames("login-input", {
                invalid: errors.email || errors.emailnotfound
              })}/>
            <span className="red-text">
              {errors.email}
              {errors.emailnotfound}
            </span>
          </div>

          <div className="login-input-container">
            <input
              onChange={this.onChange}
              value={this.state.password}
              error={errors.password}
              id="password"
              type="password"
              placeholder="Password"
              className={classnames("login-input", {
                invalid: errors.password || errors.passwordincorrect
              })}
            />
            <span className="red-text">
            {errors.password}
            {errors.passwordincorrect}
          </span>
          </div>
          <button
            type="submit"
            className="login-button"
          >
            {this.state.loading ? <div className='spinner'></div> : 'Log in'}
          </button>
          <p type='button' onClick={() => {this.props.history.push("/forgot")}} className="pw-forget">Forgot password?</p>
          <p type='button'className='join-now'>New to Cosign? <span className='join-highlight' onClick={() => {this.props.history.push("/register")}}>Join now</span></p>    
        </form>
    </div>
      );
    }
  }

// Login.propTypes = {
//   loginUser: PropTypes.func.isRequired,
//   auth: PropTypes.object.isRequired,
//   errors: PropTypes.object.isRequired
// };

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { loginUser }
)(Login);