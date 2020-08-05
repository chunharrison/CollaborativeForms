import React, {useState} from 'react'

// redux
import { connect } from 'react-redux'
import { openRoomSettingsWindow } from '../../../actions/roomActions'

// Images
import settingsImg from './settings.png';

const RoomSettings = (props) => {

    function handleSettingsClick() {
        if (props.auth.user.id === props.room.hostID) {
            props.openRoomSettingsWindow()
        }
    }   

    return (
        <div>
            {
                props.auth.user.id === props.room.hostID
                ?
                <div className='tool' onClick={() => handleSettingsClick()}>
                    <img src={settingsImg}/>
                </div>
                :
                null
            }
        </div>
        
    )
}

const mapStateToProps = state => ({
    room: state.room,
    auth: state.auth
})

export default connect(mapStateToProps, {
    openRoomSettingsWindow
})(RoomSettings)