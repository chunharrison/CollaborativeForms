import React, { useState } from 'react' 
import { connect } from 'react-redux'
import classnames from "classnames";

import EmailService from '../../services/email.service'
import { sendMessage } from '../../actions/emailActions'


const SendMessage = (props) => {

    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    

    function onSendMessageSubmit(e) {
        e.preventDefault()
        console.log('onSendMessageSubmit')
        const emailData = {
            emailMessage: email, 
            subjectMessage: subject, 
            messageMessage: message
        }
        props.sendMessage(emailData)
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
        <div>
            <div>
                <h1>
                    Send us a message
                </h1>
                <p>
                    Ask us anything you want homie
                </p>
            </div>


            <div className="contact-us-form-container">
                <form noValidate onSubmit={onSendMessageSubmit}>
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
                            className={classnames("contact-us-input", {
                                invalid: props.errors.messageMessage
                            })}
                        />
                        <span className="red-text">{props.errors.messageMessage}</span>
                    </div> 

                    <button
                        type="submit"
                        className=""
                    >
                        Send
                    </button>
                </form>
            </div> 
        </div>
    )
}

const mapStateToProps = state => ({
    errors: state.errors
});

export default connect(mapStateToProps, {
    sendMessage
})(SendMessage)