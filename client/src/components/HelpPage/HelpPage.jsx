import React, { useState } from 'react' 
import { connect } from 'react-redux'
import classnames from "classnames";
import axios from "axios";

import { sendMessage, sendErrors } from '../../actions/emailActions';

import SendButton from '../SendButton/SendButton';

import './HelpPage.css';

const HelpPage = (props) => {

    const [email, setEmail] = useState(props.auth.user.email);
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
        if (e.target.id === "send-message-subject") {
            setSubject(e.target.value)
        } else if (e.target.id === "send-message-message") {
            setMessage(e.target.value)
        }
    }

    return (
        <div className={`help-container fade-in-bottom ${Object.keys(props.errors).length !== 0 ? 'contact-expanded' : ''}`}>
            <p className='help-subheader'>
                Help
            </p>
            <div className="help-form-container">
                <form className='contact-us-form' noValidate>
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
                            className={classnames("help-textarea", {
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
        </div>
    )
}

const mapStateToProps = state => ({
    errors: state.errors,
    auth: state.auth    
});

export default connect(mapStateToProps, {
    sendMessage,
    sendErrors
})(HelpPage)