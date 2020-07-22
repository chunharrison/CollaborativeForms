import React, { useState } from 'react' 
import { connect } from 'react-redux'
import classnames from "classnames";

import EmailService from '../../services/email.service'
import { bugReport } from '../../actions/emailActions'

const BugReport = (props) => {

    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    

    function onBugReportSubmit(e) {
        e.preventDefault()

        props.bugReport({emailBug: email, subjectBug: subject, messageBug: message})
    }

    function onChange(e) {
        if (e.target.id === "bug-report-email") {
            setEmail(e.target.value)
        } else if (e.target.id === "bug-report-subject") {
            setSubject(e.target.value)
        } else if (e.target.id === "bug-report-message") {
            setMessage(e.target.value)
        }
    }

    return (
        <div>
            <div>
                <h1>
                    Report a bug
                </h1>
                <p>
                    Report us anything you want homie
                </p>
            </div>


            <div className="contact-us-form-container">
                <form noValidate onSubmit={onBugReportSubmit}>
                    <div className="contact-us-input-container">
                        <input
                            onChange={onChange}
                            value={email}
                            error={props.errors.emailBug}
                            type="text"
                            id="bug-report-email"
                            placeholder="Email"
                            className={classnames("contact-us-input", {
                                invalid: props.errors.emailBug
                            })}
                        />
                        <span className="red-text">{props.errors.emailBug}</span>
                    </div>

                    <div className="contact-us-input-container">
                        <input
                            onChange={onChange}
                            value={subject}
                            error={props.errors.subjectBug}
                            type="text"
                            id="bug-report-subject"
                            placeholder="Subject"
                            className={classnames("contact-us-input", {
                                invalid: props.errors.subjectBug
                            })}
                        />
                        <span className="red-text">{props.errors.subjectBug}</span>
                    </div>

                    <div className="contact-us-input-container">
                        <textarea
                            onChange={onChange}
                            value={message}
                            error={props.errors.messageBug}
                            placeholder="Message"
                            id="bug-report-message"
                            className={classnames("contact-us-input", {
                                invalid: props.errors.messageBug
                            })}
                        />
                        <span className="red-text">{props.errors.messageBug}</span>
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
    bugReport
})(BugReport)