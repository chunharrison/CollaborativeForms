import React, { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import axios from 'axios'
import { connect } from 'react-redux'

import CollabPage from '../CollabPage/CollabPage'

const DemoPage = (props) => {

    const [roomExists, setRoomExists] = useState(false)
    const roomCode = nanoid()


    return (<CollabPage location={props.location} demoPage={true}/>)
}

const mapStateToProps = state => ({
    auth: state.auth
})

export default connect(mapStateToProps)(DemoPage)
