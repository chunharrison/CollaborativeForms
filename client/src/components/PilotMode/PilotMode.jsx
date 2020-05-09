import React, { useRef, useState } from 'react'

// Components
import Button from 'react-bootstrap/Button';

function PilotMode(props) {

    const [waitingConfirmation, setWaitingConfirmation] = useRef(true)
    

    return (<Button
                className="pilot-mode-button"
                onClick={props.emit("")}>
                Pilot Mode
            </Button>)
}

export default PilotMode;