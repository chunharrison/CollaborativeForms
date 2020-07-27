import React, {useState, useEffect} from 'react'

import {connect} from 'react-redux'
import queryString from 'query-string';
import { Redirect } from 'react-router-dom'; // open source

const GuestJoin = (props) => {

    const [userName, setUserName] = useState('')
    const [guestID, setGuestID] = useState('')
    const [roomCode, setRoomCode] = useState('')

    useEffect(() => {
        const roomCode = '' + queryString.parse(props.location.search).roomCode
        const guestID = '' + queryString.parse(props.location.search).guestID
        setRoomCode(roomCode)
        setGuestID(guestID)
    })

    function onSubmit(e) {
        e.preventDefault()
        
        const isDemoPage = '' + queryString.parse(props.location.search).type
        if (isDemoPage === 'demo') {
            props.history.push(`/demo?username=${userName}&roomCode=${roomCode}&guestID=${guestID}`)
        } else {
            props.history.push(`/collab?username=${userName}&roomCode=${roomCode}&guestID=${guestID}`)
        }
    }   

    return (
        <form onSubmit={(e) => onSubmit(e)}>
            <input
                onChange={e => setUserName(e.target.value)}
                value={userName}
                type="text"
                placeholder="Name"
                className="login-register-input"/>
            <button
              type="submit"
              className="signin-button login-register-button"
            >
              Join
            </button>
        </form>
    )
}

const mapStateToProps = state => ({
    roomCode: state.room.roomCode,
    errors: state.errors
});

export default connect(mapStateToProps)(GuestJoin)