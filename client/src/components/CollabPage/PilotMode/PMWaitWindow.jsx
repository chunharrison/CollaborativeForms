import React, { useEffect } from 'react'

// Redux
import { connect } from 'react-redux';
import { 
    updatePMNumAccepts,
    activatePM,
    closePMWaitWindow,
    setPMButton,
    setPMIsDriver
} from '../../../actions/pilotActions'
 
// Components
import Button from 'react-bootstrap/Button'; // open source
import Modal from 'react-bootstrap/Modal'; // open source
import { 
    TacoTable, 
    DataType, 
    SortDirection, 
    Formatters, 
    Summarizers, 
    TdClassNames 
} from 'react-taco-table'; // open source


const PMWaitWindow = (props) => {

    function sendScrollPercent() {
        props.userSocket.emit("sendScrollPercent", props.canvasContainerRef.current.scrollTop)
    }

    useEffect(() => {
        // console.log('props.pmShowWaitWindow', props.pmShowWaitWindow)

        props.userSocket.on("pilotModeUserAccepted", (confirmingUserSocketID) => {
            props.pmWaitWindowTableRows.forEach((item) => {
                if (item.socketID === confirmingUserSocketID) {
                    item['status'] = 'Accepted'
                }
            })

            props.updatePMNumAccepts(props.pmNumAccepts + 1)

            
            console.log(props.pmWaitWindowTableRows.length, props.pmNumAccepts)
            if (props.pmWaitWindowTableRows.length === props.pmNumAccepts+1) {
                document.addEventListener('scroll', sendScrollPercent, true);

                // TODO (HARRISON)
                // const token = localStorage.jwtToken;
                // setAuthToken(token);
                // // Decode token and get user info and exp
                // const decoded = jwt_decode(token);
                
                setTimeout(() => {
                    props.activatePM()
                    props.closePMWaitWindow()
                    props.setPMButton('Cancel', 'danger')
                    props.setPMIsDriver(true)
                }, 2500)
                props.userSocket.emit('pilotModeActivated', {username: props.userName})
            }
        })

        props.userSocket.on("pilotModeDeclined", (confirmingUserSocketID) => {
            // console.log(`pilot mode activation failed, ${username} declined the request`)

            props.pmWaitWindowTableRows.forEach((item) => {
                if (item.socketID === confirmingUserSocketID) {
                    item['status'] = 'Declined'
                }
            })

            setTimeout(() => {
                props.closePMWaitWindow()
                props.updatePMNumAccepts()
            }, 2500)
        })
    })

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
    
    function handleClosePilotWaitingModal(event) {
        event.preventDefault()
        props.closePMWaitWindow()
    }

    return (
        <div>
            <Modal show={props.pmShowWaitWindow} backdrop="static">
                <Modal.Header>
                    <Modal.Title>Waiting Pilot Mode Confirmation</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-body'>
                    <TacoTable
                        className="pilot-mode-modal-table"
                        columns={pmWaitColumns}
                        columnHighlighting
                        data={props.pmWaitWindowTableRows}
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
    userSocket: state.room.userSocket,
    userName: state.room.userName,

    // doc
    canvasContainerRef: state.doc.canvasContainerRef,

    pmShowWaitWindow: state.pilot.pmShowWaitWindow,
    pmNumAccepts: state.pilot.pmNumAccepts,
    pmWaitWindowTableRows: state.pilot.pmWaitWindowTableRows
})

export default connect(mapStateToProps ,{
    updatePMNumAccepts,
    activatePM,
    closePMWaitWindow,
    setPMButton,
    setPMIsDriver
})(PMWaitWindow);