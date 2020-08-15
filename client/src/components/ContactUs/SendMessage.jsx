import React, { useState } from 'react' 
import { connect } from 'react-redux'
import classnames from "classnames";
import axios from "axios";

import { sendMessage, sendErrors } from '../../actions/emailActions';

import SendButton from './SendButton';

import backgroundImg from './background.png';

const SendMessage = (props) => {

    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitState, setSubmitState] = useState('Submit');

    function onSendMessageSubmit(e) {
        props.sendErrors({response: {data:{}}});
        setSubmitState('Sending...')
        const emailData = {
            emailMessage: email, 
            subjectMessage: subject, 
            messageMessage: message
        }

        axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/emails/send-message`, emailData)
        .then(res => {
            setSubmitState('Sent!');
            setTimeout(function(){ setSubmitState('Submit'); }, 1000);
            setEmail('');
            setSubject('');
            setMessage('');
        })
        .catch(err => {
            setSubmitState('Failed!');
            setTimeout(function(){ setSubmitState('Submit'); }, 1000);
            props.sendErrors(err);
        });
    }

    function onChange(e) {
        if (e.target.id === "send-message-email") {
            setEmail(e.target.value)
        } else if (e.target.id === "send-message-subject") {
            setSubject(e.target.value)
        } else if (e.target.id === "send-message-message") {
            setMessage(e.target.value)
        }
    }

    return (
        <div className={`login-container fade-in-bottom ${Object.keys(props.errors).length !== 0 ? 'contact-expanded' : ''}`}>
            <div className="contact-us-form-container">
                <p className='contact-us-logo'>cosign</p>
                <p className='send-message-header'>
                    Send us a message
                </p>
                <form className='contact-us-form' noValidate>
                    <div className="contact-us-input-container">
                        <input
                            onChange={onChange}
                            value={email}
                            error={props.errors.emailMessage}
                            type="text"
                            id="send-message-email"
                            placeholder="Email"
                            className={classnames("contact-us-input", {
                                invalid: props.errors.emailMessage
                            })}
                        />
                        <span className="red-text">{props.errors.emailMessage}</span>
                    </div>

                    <div className="contact-us-input-container">
                        <input
                            onChange={onChange}
                            value={subject}
                            error={props.errors.subjectMessage}
                            type="text"
                            id="send-message-subject"
                            placeholder="Subject"
                            className={classnames("contact-us-input", {
                                invalid: props.errors.subjectMessage
                            })}
                        />
                        <span className="red-text">{props.errors.subjectMessage}</span>
                    </div>

                    <div className="contact-us-input-container">
                        <textarea
                            onChange={onChange}
                            value={message}
                            error={props.errors.messageMessage}
                            placeholder="Message"
                            id="send-message-message"
                            className={classnames("contact-us-textarea", {
                                invalid: props.errors.messageMessage
                            })}
                        />
                        <span className="red-text">{props.errors.messageMessage}</span>
                    </div> 

                    <SendButton
                        type="submit"
                        submit={() => onSendMessageSubmit()}
                        submitState={submitState}
                    >
                        Send
                    </SendButton>
                </form>
            </div> 
            <img className='login-abstract1' src={backgroundImg}></img>

        </div>
    )
}

const mapStateToProps = state => ({
    errors: state.errors
});

export default connect(mapStateToProps, {
    sendMessage,
    sendErrors
})(SendMessage)