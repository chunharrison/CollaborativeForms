import React, { Component } from "react";
// import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser } from "../../actions/authActions";
import classnames from "classnames";

import backgroundImg from './background.png';
import alertImg from './alert.png';

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
        <form noValidate onSubmit={this.onSubmit} className="signin-form" id='login'>
          <p className='login-logo'>cosign</p>
          <p className="login-header">Welcome Back</p>
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
            <div className='alert-module' style={{'display': `${this.props.errors.email ||  this.props.errors.emailnotfound? '' : 'none'}`}}>
              <img src={alertImg} className='alert-image'/>
              <span className="red-text">
                {this.props.errors.email}
                {this.props.errors.emailnotfound}
              </span>
            </div>
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
            <div className='alert-module' style={{'display': `${this.props.errors.password ||  this.props.errors.passwordincorrect? '' : 'none'}`}}>
              <img src={alertImg} className='alert-image'/>
              <span className="red-text">{this.props.errors.password}
              {this.props.errors.passwordincorrect}</span>
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
        <img className='login-abstract1' src={backgroundImg}></img>

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