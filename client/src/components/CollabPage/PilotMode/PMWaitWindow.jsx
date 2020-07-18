import React, { useEffect, useState } from 'react'

// Redux
import { connect } from 'react-redux';
import { 
    setPMState,
    closePMWaitWindow 
} from '../../../actions/pilotActions'
 
// Components
import Button from 'react-bootstrap/Button'; // open source
import Modal from 'react-bootstrap/Modal'; // open source
import { 
    TacoTable, 
    DataType,
} from 'react-taco-table'; // open source

// Libraries
import axios from 'axios'


const PMWaitWindow = (props) => {

    const [socketUpdated, setSocketUpdated] = useState(false)

    let pmNumAccepts = 0

    const pmWaitColumns = [
        {
            id: 'user',
            type: DataType.String,
            header: 'User',
        },
        {
            id: 'status',
            type: DataType.String,
            header: 'Status',
            tdStyle(cellData) {
                if (cellData === "Pending") {
                    return { color: '#CCCC00' };
                } else if (cellData === "Accepted") {
                    return { color: 'green' };
                } else if (cellData === "Declined") {
                    return { color: '#DC143C' };
                }

                return undefined;
            }
        }
    ]

    function sendScrollPercent() {
        props.room.userSocket.emit("sendScrollPercent", props.canvasContainerRef.current.scrollTop)
    }
    
    function handleClosePilotWaitingModal(event) {
        event.preventDefault()
        props.closePMWaitWindow()
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
    

    useEffect(() => {
        if (!socketUpdated) {
            // props.room.userSocket.on("pilotModeUserAccepted", (confirmingUserGuestID) => {
            //     console.log(props.pilot.pmWaitWindowTableRows)
            //     props.pilot.pmWaitWindowTableRows.forEach((item) => {
            //         console.log(item.guestID, confirmingUserGuestID)
            //         if (item.guestID === confirmingUserGuestID) {
            //             item['status'] = 'Accepted'
            //             pmNumAccepts += 1
            //         }
            //     })
                
            //     if (props.pilot.pmWaitWindowTableRows.length === pmNumAccepts &&
            //         props.pilot.pmWaitWindowTableRows.length !== 0) {
            //         document.addEventListener('scroll', sendScrollPercent, true);
    
            //         setTimeout(() => {
            //             activatePM()
            //             props.setPMState(true)
            //             props.closePMWaitWindow()
            //         }, 2500)
            //         props.room.userSocket.emit('pilotModeActivated')
            //     }
            // })

            // props.room.userSocket.on("pilotModeDeclined", (confirmingUserGuestID) => {
    
            //     props.pilot.pmWaitWindowTableRows.forEach((item) => {
            //         if (item.guestID === confirmingUserGuestID) {
            //             item['status'] = 'Declined'
            //         }
            //     })
    
            //     setTimeout(() => {
            //         props.closePMWaitWindow()
            //     }, 2500)
    
            // })


            setSocketUpdated(true)
        }
    })

    return (
        <div>
            <Modal show={props.pilot.pmShowWaitWindow} backdrop="static">
                <Modal.Header>
                    <Modal.Title>Waiting Pilot Mode Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-body'>
                    <TacoTable
                        className="pilot-mode-modal-table"
                        columns={pmWaitColumns}
                        columnHighlighting
                        data={props.pilot.pmWaitWindowTableRows}
                        striped
                        sortable
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={(event) => handleClosePilotWaitingModal(event)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}


const mapStateToProps = state => ({
    // room
    room: state.room,

    // doc
    canvasContainerRef: state.doc.canvasContainerRef,

    // pilot
    pilot: state.pilot
})

export default connect(mapStateToProps ,{
    setPMState,
    closePMWaitWindow
})(PMWaitWindow);