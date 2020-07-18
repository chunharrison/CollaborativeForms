import React, { useState, useEffect } from 'react'
import pilotImg from './pilot-mode.png';

// Redux
import { connect } from 'react-redux';
import { 
    setPMState,

    openPMWaitWindow,
    setPMWaitWindowTableRows,
    openPMConfirmWindow,

    setPMRequesterSocketID,
} from '../../../actions/pilotActions'

// libraries
import axios from 'axios';


const PilotMode = (props) => {
    
    const [socketUpdated, setSocketUpdated] = useState(false)
    const [pmWaitWindowTableRows, setPmWaitWindowTableRows] = useState([])
    let pmNumAccepts = 0

    function sendScrollPercent() {
        props.room.userSocket.emit("sendScrollPercent", props.canvasContainerRef.current.scrollTop)
    }

    function activatePM() {
        const options = {
            params: {
                roomCode: props.state.roomCode,
                status: true,
            },
            headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': '*',
            },
        }
        axios.post('/api/room/set-pilot-mode-status', options)
    }

    function deactivatePM() {
        const options = {
            params: {
                roomCode: props.state.roomCode,
                status: false,
            },
            headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': '*',
            },
        }
        axios.post('/api/room/set-pilot-mode-status', options)
    }

    useEffect(() => {
        if (pmWaitWindowTableRows !== []) {
            // console.log(pmWaitWindowTableRows)
            // props.room.userSocket.emit("pilotModeRequested", props.room.userSocket.id)
        }

        if (!socketUpdated) {
            props.room.userSocket.on("confirmPilotMode", (requestData) => {
                const { requesterSocketID, pmWaitWindowTableRows } = requestData
                props.openPMConfirmWindow()
                props.setPMRequesterSocketID(requesterSocketID)
            })

            props.room.userSocket.on("setScrollPercent", (scrollPercent) => {
                props.canvasContainerRef.current.scrollTop = scrollPercent
            })

            props.room.userSocket.on('pilotModeStopped', () => {
                deactivatePM()
                props.setPMState(false)
            })

            // person is using the pilot mode right now for the room
            props.room.userSocket.on('pilotModeActivated', () => {
                activatePM()
                props.setPMState(true)
            })

            props.room.userSocket.on('pilotModeUserConnected', () => {
                console.log('pilotModeUserConnected')
                if (props.auth.isAuthenticated) {
                    document.addEventListener('scroll', sendScrollPercent, true);
                } 

                props.setPMState(true)
            })

            props.room.userSocket.on("pilotModeUserAccepted", (confirmingUserGuestID) => {
                console.log(pmWaitWindowTableRows)
                pmWaitWindowTableRows.forEach((item) => {
                    console.log(item.guestID, confirmingUserGuestID)
                    if (item.guestID === confirmingUserGuestID) {
                        item['status'] = 'Accepted'
                        pmNumAccepts += 1
                    }
                })
                
                if (pmWaitWindowTableRows.length === pmNumAccepts &&
                    pmWaitWindowTableRows.length !== 0) {
                    document.addEventListener('scroll', sendScrollPercent, true);
    
                    setTimeout(() => {
                        activatePM()
                        props.setPMState(true)
                        props.closePMWaitWindow()
                    }, 2500)
                    props.room.userSocket.emit('pilotModeActivated')
                }
            })

            props.room.userSocket.on("pilotModeDeclined", (confirmingUserGuestID) => {
    
                pmWaitWindowTableRows.forEach((item) => {
                    if (item.guestID === confirmingUserGuestID) {
                        item['status'] = 'Declined'
                    }
                })
    
                setTimeout(() => {
                    props.closePMWaitWindow()
                }, 2500)
    
            })


            setSocketUpdated(true)
        }
    }, [pmWaitWindowTableRows])

    function requestPilotMode() {
        let pmWaitWindowTableRowsNew = []
        const currentUsersEntries = Object.entries(props.room.guestObject)
        for (const [guestID, username] of currentUsersEntries) {
            const rowValues = {
                "guestID": guestID,
                "user": username,
                "status": "Pending"
            }
            pmWaitWindowTableRowsNew.push(rowValues)
        }


        // redux
        props.openPMWaitWindow()
        console.log(pmWaitWindowTableRowsNew, pmWaitWindowTableRows)
        setPmWaitWindowTableRows(pmWaitWindowTableRowsNew)
        console.log(pmWaitWindowTableRowsNew, pmWaitWindowTableRows)

        console.log(props.tableRows)
        props.setPMWaitWindowTableRows(pmWaitWindowTableRowsNew)
        console.log(props.tableRows)
        
        // socket.io
        const requestData = {
            requesterSocketID: props.room.userSocket.id,
            pmWaitWindowTableRows: pmWaitWindowTableRowsNew,
        }
        props.room.userSocket.emit("pilotModeRequested", requestData)
    }


    
    function handlePMButtonClick(e) {
        e.preventDefault()

        // already activated 
        // the driver deactivates the Pilot Mode 
        if (props.pilot.pmActivated && props.auth.isAuthenticated) {
            // remove scroll event listener function
            document.removeEventListener('scroll', sendScrollPercent, true);
            
            // redux
            props.setPMState(false) // state
            deactivatePM() // db

            // emit
            props.room.userSocket.emit('pilotModeStopped')
        }

        // not activated
        // request
        else if (!props.pilot.pmActivated && props.auth.isAuthenticated) {
            requestPilotMode()
        }
    }


    return (
        <button
            className="pilot-mode-button"
            onClick={(e) => handlePMButtonClick(e)}>
            <img src={pilotImg}/>
            {props.pilot.pmActivated ? <div className='pilot-mode-active'></div> : <div className='pilot-mode-inactive'></div>}
        </button>
    )
}

const mapStateToProps = state => ({
    // auth
    auth: state.auth,

    // room
    room: state.room,

    // doc
    canvasContainerRef: state.doc.canvasContainerRef,

    // pilot mode
    pilot: state.pilot,
    tableRows: state.pilot.pmWaitWindowTableRows
})

export default connect(mapStateToProps, {
    setPMState,

    openPMWaitWindow,
    setPMWaitWindowTableRows,
    openPMConfirmWindow,

    setPMRequesterSocketID,
})(PilotMode);