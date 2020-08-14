import React, { useState, useEffect, useRef } from 'react' 

import './SendButton.css';

const SendButton = (props) => {

    const [buttonMessage, setButtonMessage] = useState('Submit')
    const submitLabel = useRef(null);

    useEffect(() => {
        submitLabel.current.classList.add('submit-button-fade-out');
        setTimeout(function(){ 
            submitLabel.current.classList.add('submit-button-fade-in');
            setButtonMessage(props.submitState); 
        }, 200);
        setTimeout(function(){ submitLabel.current.classList.remove('submit-button-fade-out'); }, 400);
        setTimeout(function(){ submitLabel.current.classList.remove('submit-button-fade-in'); }, 600);
    }, [props.submitState])

    function triggerSubmit(e) {
        e.preventDefault();
        props.submit();
    }

    return (
        <button className='account-submit-button' onClick={(e) => triggerSubmit(e)}>
            <span className='submit-button-message' ref={submitLabel}>{buttonMessage}</span>
        </button>
    )
}

export default SendButton;