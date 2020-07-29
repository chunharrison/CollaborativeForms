import React from 'react'

import SendMessage from './SendMessage'
import BugReport from './BugReport'

import './ContactUs.css';

const ContactUs = () => {
    return (<div className='contact-us-background'>
                <div className='contact-us-abstract1'></div>
                <SendMessage/>
                <p className='contact-us-logo'>cosign</p>
            </div>)
}


export default ContactUs;

