import React, { useState, useEffect } from 'react' 
import { connect } from 'react-redux'
import classnames from "classnames";
import axios from "axios";
import Modal from 'react-bootstrap/Modal';

import { sendMessage, sendErrors } from '../../actions/emailActions';

import bugImg from './bug.png';

import './HelpPage.css';

const HelpPage = (props) => {

    const [email, setEmail] = useState(props.auth.user.email);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showBugModal, setShowBugModal] = useState(false);

    function onSendMessageSubmit(e) {
        setLoading(true);
        e.preventDefault();
        props.sendErrors({response: {data:{}}});
        const emailData = {
            emailMessage: email, 
            subjectMessage: subject, 
            messageMessage: message
        }

        axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/emails/send-message`, emailData)
        .then(res => {
            setEmail('');
            setSubject('');
            setMessage('');
            setLoading(false);
            setShowBugModal(false);
        })
        .catch(err => {
            setLoading(false);
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

    useEffect(() => {
        localStorage.setItem('page', 'help');

    })

    return (
        <div className={`help-container fade-in-bottom ${Object.keys(props.errors).length !== 0 ? 'contact-expanded' : ''}`}>
            <p className='help-subheader'>
                Help
            </p>
            <div className='help-bug-card' onClick={() => setShowBugModal(true)}>
                <img className='help-bug-image' src={bugImg}></img>
                <p className='help-bug-header'>Report a Bug</p>
                <p className='help-bug-description'>Troubleshoot issues and let us help you out with your problems</p>
            </div>
            <Modal className='account-modal-dialog' show={showBugModal} onHide={() => setShowBugModal(false)} size="m">
                <Modal.Body className='help-modal-body'>
                <div className="help-form-container">
                <form className='help-form' noValidate onSubmit={(e) => onSendMessageSubmit(e)}>
                    <div className="contact-us-input-container">
                        <input
                            onChange={onChange}
                            value={subject}
                            error={props.errors.subjectMessage}
                            type="text"
                            id="send-message-subject"
                            placeholder="Title"
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
                            placeholder="Bug Description"
                            id="send-message-message"
                            className={classnames("help-textarea", {
                                invalid: props.errors.messageMessage
                            })}
                        />
                        <span className="red-text">{props.errors.messageMessage}</span>
                    </div> 

                    <button
                        type="submit"
                        className='help-button'
                    >
                        {loading ? <div className='login-spinner'></div> : 'Send'}
                    </button>
                </form>
            </div>
                </Modal.Body>
            </Modal>
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