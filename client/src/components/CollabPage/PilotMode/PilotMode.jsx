import React, { useState, useEffect } from 'react'
import pilotImg from './pilot-mode.png';

// Redux
import { connect } from 'react-redux';
import { 
    activatePM,
    deactivatePM,
    setPMIsDriver,
    setPMDriverName,
    setPMButton,
    updatePMNumAccepts,

    openPMWaitWindow,
    closePMWaitWindow,
    openPMConfirmWindow,
    closePMConfirmWindow,

    setPMRequesterInfo,
    setPMCurrNumUsers,
    setPMWaitWindowTableRows
} from '../../../actions/pilotActions'

// Components
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

const PilotMode = (props) => {
    
    const [socketUpdated, setSocketUpdated] = useState(false)

    useEffect(() => {
        if (!socketUpdated) {
            props.userSocket.on("confirmPilotMode", (requestData) => {
                // console.log(currNumUsers)
                const { requesterUsername, requesterSocketID, currNumUsers } = requestData
                
                props.openPMConfirmWindow()
                props.setPMRequesterInfo(requesterUsername, requesterSocketID)
                props.setPMCurrNumUsers(currNumUsers)
            })

            props.userSocket.on("setScrollPercent", (scrollPercent) => {
                // console.log("setScrollPercent")
                props.canvasContainerRef.current.scrollTop = scrollPercent
            })

            props.userSocket.on('pilotModeStopped', () => {
                // reactivate scroll effects
                console.log('pilotModeStopped')
                this.setState(() => {
                    props.deactivatePM()
                    props.setPMIsDriver(false)
                    props.setPMButton('Activate', 'info')
                })
            })

            // person is using the pilot mode right now for the room
            props.userSocket.on('pilotModeActivatedByUser', (driverUsername) => {
                // console.log("PILOTMODEACTIVATREDDGDKFNGSJGFSGF")
                props.activatePM()
                props.setPMDriverName(driverUsername)
                props.setPMButton('Activated', 'warning')
            })

            setSocketUpdated(true)
        }
    })

    function requestPilotMode() {
        // request pilot mode to other users via socket.io and then
        // it returns a callback function 
        // let otherUsers = this.state.currentUsers
        // delete otherUsers[this.state.socket.id]

        // for list of users that need to confirm or decline the request
        let pmWaitWindowTableRowsNew = []
        const currentUsersEntries = Object.entries(props.currentUsers)
        for (const [socketID, username] of currentUsersEntries) {
            if (socketID === props.userSocket.id) {
                continue;
            }
            const rowValues = {
                "socketID": socketID,
                "user": username,
                "status": "Pending"
            }
            pmWaitWindowTableRowsNew.push(rowValues)
        }

        props.openPMWaitWindow()
        props.setPMWaitWindowTableRows(pmWaitWindowTableRowsNew)
    
        const requestData = {
            requesterUsername: props.userName,
            requesterSocketID: props.userSocket.id,
            currNumUsers: Object.keys(props.currentUsers).length - 1,
        }
        props.userSocket.emit("pilotModeRequested", requestData)
    }

    function sendScrollPercent() {
        props.userSocket.emit("sendScrollPercent", props.canvasContainerRef.current.scrollTop)
    }

    // button that is clicked when the room is in Pilot Mode
    // if the Driver clicks it, it changes the 
    function handlePMButtonClick(e) {
        console.log("handlePMButtonClick")
        e.preventDefault()
        // already activated 
        // console.log('handlePMButtonClick')
        // console.log(this.state.pmActivated, this.state.pmIsDriver)

        // the driver deactivates the Pilot Mode 
        if (props.pmActivated && props.pmIsDriver) {
            document.removeEventListener('scroll', sendScrollPercent, true);

            props.deactivatePM()
            props.setPMButton('Activate', 'info')
            props.setPMIsDriver(false)
            props.updatePMNumAccepts(0)
            
            props.userSocket.emit('pilotModeStopped')
        }

        // 
        else if (!props.pmActivated && !props.pmIsDriver) {
            requestPilotMode()
        }
    }


    return (
        <button
            className="pilot-mode-button"
            onClick={(e) => handlePMButtonClick(e)}>
            <img src={pilotImg}/>
            {props.pmActivated ? <div className='pilot-mode-active'></div> : <div className='pilot-mode-inactive'></div>}
        </button>
    )
}

const mapStateToProps = state => ({
    // room
    userName: state.room.userName,
    userSocket: state.room.userSocket,
    currentUsers: state.room.currentUsers,

    // doc
    canvasContainerRef: state.doc.canvasContainerRef,

    // pilot mode
    pmActivated: state.pilot.pmActivated,
    pmIsDriver: state.pilot.pmIsDriver,
    pmButtonLabel: state.pilot.pmButtonLabel,
    pmButtonVariant: state.pilot.pmButtonVariant,
    // pmNumAccepts: state.pilot.pmNumAccepts,

    // pmShowWaitWindow: state.pilot.pmShowWaitWindow,
    // pmShowConfirmWindow: state.pilot.pmShowConfirmWindow,
})

export default connect(mapStateToProps, {
    activatePM,
    deactivatePM,
    setPMIsDriver,
    setPMDriverName,
    setPMButton,
    updatePMNumAccepts,
    openPMWaitWindow,
    closePMWaitWindow,
    openPMConfirmWindow,
    closePMConfirmWindow,

    setPMRequesterInfo,
    setPMCurrNumUsers,
    setPMWaitWindowTableRows
})(PilotMode);