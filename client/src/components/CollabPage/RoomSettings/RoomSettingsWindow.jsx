import React, {useState} from 'react'

// redux
import { connect } from 'react-redux'
import { 
    closeRoomSettingsWindow,
    setMaxNumGuests,
    updateDownloadOption
} from '../../../actions/roomActions'


// Bootstrap
import Modal from 'react-bootstrap/Modal'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'


// libraries 
import Select from 'react-select'



const RoomSettingsWindow = (props) => {
    const [newCapacity, setNewCapacity] = useState(props.room.numMaxGuests)
    const [newDownloadOption, setNewDownloadOption] = useState(props.room.downloadOption)

    function handleMaxNumGuestChangeClick(e) {
        e.preventDefault()
        props.setMaxNumGuests({
            roomCode: props.room.roomCode,
            newCapacity: newCapacity
        })
    }

    function handleDownloadOptionChangeClick(e) {
        e.preventDefault()
        console.log('handleDownloadOptionChangeClick', props.room.roomCode, newDownloadOption)
        props.room.userSocket.emit('setDownloadOption', newDownloadOption)
        props.updateDownloadOption(newDownloadOption)
    }

    const capacityOptions = [
        { value: 1, label: 1 },
        { value: 2, label: 2 }
    ]
    const capacityDefaultValue = {
        value: props.room.numMaxGuests,
        label: props.room.numMaxGuests
    }

    function onCapacityChangeHandler(e) {
        console.log('onCapacityChangeHandler', e.value)
        setNewCapacity(e.value)
    }

    const downloadOptions = [
        { value: 'Both', label: 'Both' },
        { value: 'Original', label: 'Original' },
        { value: 'Signed', label: 'Signed' },
        { value: 'None', label: 'None' }
    ]
    const downloadOptionDefaultValue = {
        value: props.room.downloadOption,
        label: props.room.downloadOption
    }

    function onDownloadOptionChangeHandler(e) {
        setNewDownloadOption(e.value)
    }

    function handleExitButtonClick(e) {
        e.preventDefault()

        props.closeRoomSettingsWindow()
    }

    function onWindowHide() {
        props.closeRoomSettingsWindow()
    }

    return (
        <div>
            <Modal className='settings-modal-dialog' show={props.room.showRoomSettingsWindow} dialogClassName="modal-90w" onHide={() => onWindowHide()}>
                <Modal.Header className='settings-modal-header'>
                    <Modal.Title>Room Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body className='settings-modal-body'>
                    <Container>
                        <Row className="settings-modal-row">
                            <Col className="settings-modal-col">
                                Room Capacity
                            </Col>
                            <Col className="settings-modal-col">
                                <Select
                                    className="settings-modal-dropdown" 
                                    options={capacityOptions} 
                                    value={{value: newCapacity, label: newCapacity}} 
                                    defaultValue={capacityDefaultValue}
                                    onChange={e => onCapacityChangeHandler(e)}
                                />
                            </Col>
                            <Col className="settings-modal-col">
                                <button className="settings-change-button" onClick={e => handleMaxNumGuestChangeClick(e)}>Change</button>
                            </Col>
                        </Row>
                        <Row className="settings-modal-row">
                            <Col className="settings-modal-col">
                                Download Option
                            </Col>
                            <Col className="settings-modal-col">
                            <Select
                                className="settings-modal-dropdown" 
                                options={downloadOptions}
                                value={{value: newDownloadOption, label: newDownloadOption}}
                                defaultValue={downloadOptionDefaultValue}
                                onChange={e => onDownloadOptionChangeHandler(e)}
                            />
                            </Col> 
                            <Col className="settings-modal-col">
                                <button className="settings-change-button" onClick={e => handleDownloadOptionChangeClick(e)}>Change</button>
                            </Col>
                        </Row>
                        <Row className="settings-modal-row">
                            <Col className="settings-modal-col">
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <button className="settings-exit-button" onClick={e => handleExitButtonClick(e)}>Exit</button>
                </Modal.Footer>
            </ Modal>
        </div>
    )
}

const mapStateToProps = state => ({
    room: state.room
})

export default connect(mapStateToProps, {
    closeRoomSettingsWindow,
    setMaxNumGuests,
    updateDownloadOption
})(RoomSettingsWindow)