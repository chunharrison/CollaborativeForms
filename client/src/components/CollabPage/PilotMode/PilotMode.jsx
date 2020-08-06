import React, { useState, useEffect } from 'react'
import pilotImg from './pilot-mode.png';

// Redux
import { connect } from 'react-redux';
import { 
    setPMState,

    openPMWaitWindow,
    closePMWaitWindow,
    setPMWaitWindowTableRows,
    openPMConfirmWindow,
    

    setPMRequesterSocketID,
} from '../../../actions/pilotActions'

// libraries
import axios from 'axios';


const PilotMode = (props) => {
    
    let pmNumAccepts = 0;
    const [pmState, setPMState] = useState(false)

    function sendScrollPercent() {
        props.room.userSocket.emit("sendScrollPercent", props.canvasContainerRef.current.scrollTop)
    }

    function activatePM() {
        const params = {
                roomCode: props.room.roomCode,
                status: true,
            }
        axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/room/set-pilot-mode-status`, params)
    }

    function deactivatePM() {
        const params = {
                roomCode: props.room.roomCode,
                status: false,
            }
        axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/api/room/set-pilot-mode-status`, params)
    }

    useEffect(() => {
        props.room.userSocket.on("confirmPilotMode", (requestData) => {
            console.log("confirmPilotMode", requestData)
            const { requesterSocketID } = requestData
            props.openPMConfirmWindow()
            props.setPMRequesterSocketID(requesterSocketID)
        })

        props.room.userSocket.on("setScrollPercent", (scrollPercent) => {
            props.canvasContainerRef.current.scrollTop = scrollPercent
        })

        props.room.userSocket.on('pilotModeStopped', () => {
            props.setPMState(false)
            setPMState(false)
        })

        // person is using the pilot mode right now for the room
        props.room.userSocket.on('pilotModeActivated', () => {
            props.setPMState(true)
            setPMState(true)
        })

        props.room.userSocket.on('pilotModeUserConnected', () => {
            if (props.auth.user.id === props.room.hostID) {
                // document.addEventListener('scroll', sendScrollPercent, true);
            } 

            props.setPMState(true)
            setPMState(true)
        })

        props.room.userSocket.on("pilotModeUserAccepted", (confirmingUserGuestID) => {
            props.pmWaitWindowTableRows.forEach((item) => {
                if (item.guestID === confirmingUserGuestID) {
                    item['status'] = 'Accepted'
                    pmNumAccepts += 1
                }
            })
            
            if (props.pmWaitWindowTableRows.length === pmNumAccepts &&
                props.pmWaitWindowTableRows.length !== 0) {
                // document.addEventListener('scroll', sendScrollPercent, true);

                setTimeout(() => {
                    activatePM()
                    props.setPMState(true)
                    setPMState(true)
                    props.closePMWaitWindow()
                }, 2500)
                props.room.userSocket.emit('pilotModeActivated')
            }
        })

        props.room.userSocket.on("pilotModeDeclined", (confirmingUserGuestID) => {
            props.pmWaitWindowTableRows.forEach((item) => {
                if (item.guestID === confirmingUserGuestID) {
                    item['status'] = 'Declined'
                }
            })

            setTimeout(() => {
                props.closePMWaitWindow()
            }, 2500)

        })
        return () => {
            props.room.userSocket.off("confirmPilotMode", (requestData) => {
                const { requesterSocketID, pmWaitWindowTableRows } = requestData
                props.openPMConfirmWindow()
                props.setPMRequesterSocketID(requesterSocketID)
            })
    
            props.room.userSocket.off("setScrollPercent", (scrollPercent) => {
                props.canvasContainerRef.current.scrollTop = scrollPercent
            })
    
            props.room.userSocket.off('pilotModeStopped', () => {
                props.setPMState(false)
                setPMState(false)
            })
    
            // person is using the pilot mode right now for the room
            props.room.userSocket.off('pilotModeActivated', () => {
                props.setPMState(true)
                setPMState(true)
            })
    
            props.room.userSocket.off('pilotModeUserConnected', () => {
                if (props.auth.user.id === props.room.hostID) {
                    // document.addEventListener('scroll', sendScrollPercent, true);
                } 
    
                props.setPMState(true)
                setPMState(true)
            })
    
            props.room.userSocket.off("pilotModeUserAccepted", (confirmingUserGuestID) => {
                props.pmWaitWindowTableRows.forEach((item) => {
                    if (item.guestID === confirmingUserGuestID) {
                        item['status'] = 'Accepted'
                        pmNumAccepts += 1
                    }
                })
                
                if (props.pmWaitWindowTableRows.length === pmNumAccepts &&
                    props.pmWaitWindowTableRows.length !== 0) {
                    // document.addEventListener('scroll', sendScrollPercent, true);
    
                    setTimeout(() => {
                        activatePM()
                        props.setPMState(true)
                        setPMState(true)
                        props.closePMWaitWindow()
                    }, 2500)
                    props.room.userSocket.emit('pilotModeActivated')
                }
            })
    
            props.room.userSocket.off("pilotModeDeclined", (confirmingUserGuestID) => {
                props.pmWaitWindowTableRows.forEach((item) => {
                    if (item.guestID === confirmingUserGuestID) {
                        item['status'] = 'Declined'
                    }
                })
    
                setTimeout(() => {
                    props.closePMWaitWindow()
                }, 2500)
    
            })
        }
    })
    
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
        props.setPMWaitWindowTableRows(pmWaitWindowTableRowsNew)
        // socket.io
        const requestData = {
            requesterSocketID: props.room.userSocket.id,
        }
        
        props.room.userSocket.emit("pilotModeRequested", requestData)
    }


    useEffect(() => {
        if (pmState && props.auth.user.id === props.room.hostID) {
            document.addEventListener('scroll', sendScrollPercent, true);
            return ()=> {document.removeEventListener('scroll', sendScrollPercent, true);}
        }
    }, [pmState])
    
    function handlePMButtonClick(e) {
        e.preventDefault()

        console.log(props.auth.user.id, props.room.hostID)

        // already activated 
        // the driver deactivates the Pilot Mode 
        if (props.pilot.pmActivated && props.auth.user.id === props.room.hostID) {
            // remove scroll event listener function
            // document.removeEventListener('scroll', sendScrollPercent);
            
            // redux
            props.setPMState(false) // state
            setPMState(false)
            deactivatePM() // db

            // emit
            props.room.userSocket.emit('pilotModeStopped')
        }

        // not activated
        // request
        else if (!props.pilot.pmActivated && props.auth.user.id === props.room.hostID) {
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
    pmWaitWindowTableRows: state.pilot.pmWaitWindowTableRows
})

export default connect(mapStateToProps, {
    setPMState,

    openPMWaitWindow,
    closePMWaitWindow,
    setPMWaitWindowTableRows,
    openPMConfirmWindow,

    setPMRequesterSocketID,
})(PilotMode);