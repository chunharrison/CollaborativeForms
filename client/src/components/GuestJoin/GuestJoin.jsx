import React, {useState, useEffect} from 'react'

// Redux
import {connect} from 'react-redux'

// Libraries
import queryString from 'query-string';
import {nanoid} from 'nanoid';

// Services
import GuestService from '../../services/guest.services'

// CSS
import './GuestJoin.css'

const GuestJoin = (props) => {
    let pageElements = <div>hi</div>
    const uniqueGuestID = nanoid()
    const [userName, setUserName] = useState('')
    const [guestID, setGuestID] = useState('')
    const [roomCode, setRoomCode] = useState('' + queryString.parse(props.location.search).roomCode)
    const [invitationCode, setInvitationCode] = useState('' + queryString.parse(props.location.search).invitationCode)
    const [validInvitationCode, setValidInvitationCode] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [roomSet, setRoomSet] = useState(false)

    useEffect(() => {
        // check to see if the guest is already a user or not
        if (this.props.auth.isAuthenticated) {
            // then send them to the collab page
            const isDemoPage = '' + queryString.parse(props.location.search).type
            if (isDemoPage === 'demo') {
                props.history.push(`/demo?username=${props.auth.user.name}&roomCode=${roomCode}&guestID=${uniqueGuestID}`)
            } else {
                props.history.push(`/collab?username=${props.auth.user.name}&roomCode=${roomCode}&guestID=${uniqueGuestID}`)
            }
        }

        // get values from query parameters
        if (guestID === '') setGuestID(uniqueGuestID)
        if (roomCode === '') setRoomCode('' + queryString.parse(props.location.search).roomCode)
        if (invitationCode === '') setInvitationCode('' + queryString.parse(props.location.search).invitationCode)
    })

    useEffect(() => {
        // make sure query param data has been fetched
        if (roomCode !== '' && invitationCode !== '' && !roomSet) {
            GuestService.validateInvitationCode(roomCode, invitationCode)
                .then(validCode => {
                    setValidInvitationCode(validCode)
                    if (validCode === 'invalidRoomCode') setErrorMessage('A room corresponding to the code given does not exist.')
                    if (!validCode) setErrorMessage('The link has expired or is containing an invalid invitation code.')
                })
                .catch(err => {
                    console.log(err)
                })

            setRoomSet(true)
        }
    }, [roomCode, invitationCode, validInvitationCode])

    function onSubmit(e) {
        e.preventDefault()
        
        const isDemoPage = '' + queryString.parse(props.location.search).type
        if (isDemoPage === 'demo') {
            props.history.push(`/demo?username=${userName}&roomCode=${roomCode}&guestID=${guestID}`)
        } else {
            props.history.push(`/collab?username=${userName}&roomCode=${roomCode}&guestID=${guestID}`)
        }
    }   

    return (<div className='guest-join-container'>
        {
            validInvitationCode === true
            ?
            <form onSubmit={(e) => onSubmit(e)} className="forgot-password-container fade-in">
                <p className='forgot-password-header' >Enter Name</p>
                <input
                    onChange={e => setUserName(e.target.value)}
                    value={userName}
                    type="text"
                    placeholder="Name"
                    className='forgot-password-input'/>
                <button
                    type="submit"
                    className="signin-button login-register-button">
                Join
                </button>
            </form>
            :
                <div className="invalid-room-code">
                    <div className="error-code-div">
                        <h1 className="error-code">
                            404
                            <br/><br/><br/>
                        </h1>
                    </div>
                    <div className="warning-message-div">
                        <h1 className="warning-message">
                            {errorMessage}
                        </h1>
                    </div>
                </div>
        }
    </div>)
}

const mapStateToProps = state => ({
    roomCode: state.room.roomCode,
    errors: state.errors,
    auth: state.auth
});

export default connect(mapStateToProps)(GuestJoin)