import React, {useEffect, useState} from 'react'

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
    const [capacityOptions, setCapacityOptions] = useState([{ value: 1, label: 1 }])
    const [newDownloadOption, setNewDownloadOption] = useState(props.room.downloadOption)

    useEffect(() => {
        // console.log('props.room.guestCapacity', props.room.guestCapacity)
        let newCapacityOptions = []
        for (let i = 1; i <= props.room.guestCapacity; i++) {
            newCapacityOptions.push({ value: i, label: i })
        }
        setCapacityOptions(newCapacityOptions)
    }, [props.room.guestCapacity])

    useEffect(() => {
        // console.log(props.room.numMaxGuests)
        setNewCapacity(props.room.numMaxGuests)
    }, [props.room.numMaxGuests])

    useEffect(() => {
        setNewDownloadOption(props.room.downloadOption)
    }, [props.room.downloadOption])

    useEffect(() => {
        const changeCapacityButton = document.getElementById('room-capacity-button');
        if (newCapacity !== props.room.numMaxGuests && changeCapacityButton !== null) {
            changeCapacityButton.classList.remove("unchangable")
        } else if (newCapacity === props.room.numMaxGuests && changeCapacityButton !== null) {
            changeCapacityButton.classList.add("unchangable")
        }
    }, [props.room.numMaxGuests, newCapacity])

    useEffect(() => {
        const changeDownloadOptionsButton = document.getElementById('download-options-button');
        if (newDownloadOption !== props.room.downloadOption && changeDownloadOptionsButton !== null) {
            changeDownloadOptionsButton.classList.remove("unchangable")
        } else if (newDownloadOption === props.room.downloadOption && changeDownloadOptionsButton !== null) {
            changeDownloadOptionsButton.classList.add("unchangable")
        }
    }, [props.room.downloadOption,newDownloadOption])

    function handleMaxNumGuestChangeClick(e) {
        e.preventDefault()

        // if (newCapacity !== props.room.numMaxGuests) {
        //     console.log('handleMaxNumGuestChangeClick')
            props.setMaxNumGuests({
                roomCode: props.room.roomCode,
                newCapacity: newCapacity
            })
        // }
    }

    function handleDownloadOptionChangeClick(e) {
        e.preventDefault()

        // if (newDownloadOption !== props.room.downloadOption) {
        //     console.log('handleDownloadOptionChangeClick')
            props.room.userSocket.emit('setDownloadOption', newDownloadOption)
            props.updateDownloadOption(newDownloadOption)
        // }
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
                                    onChange={e => onCapacityChangeHandler(e)}
                                />
                            </Col>
                            <Col className="settings-modal-col">
                                <button id="room-capacity-button" className="settings-change-button unchangable" onClick={e => handleMaxNumGuestChangeClick(e)}>Apply</button>
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
                                <button id="download-options-button" className="settings-change-button unchangable" onClick={e => handleDownloadOptionChangeClick(e)}>Apply</button>
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

const mapStateToProps = state => {
    console.log('state', state)
    return {room: state.room}
}

export default connect(mapStateToProps, {
    closeRoomSettingsWindow,
    setMaxNumGuests,
    updateDownloadOption
})(RoomSettingsWindow)