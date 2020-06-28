import React, { useState } from 'react'

// Redux
import { connect } from 'react-redux';

// Components
import Dropdown from 'react-bootstrap/Dropdown';
import Badge from 'react-bootstrap/Badge';

const UsersList = (props) => {
    
    return (
        <Dropdown drop='up'>
            <Dropdown.Toggle>
                Users  <Badge variant="light">{Object.keys(props.currentUsers).length}</Badge>
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {Object.entries(props.currentUsers).map(([socketid, username], i) => (
                    <Dropdown.Item>{username}</Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    )
}

const mapStateToProps = state => ({
    // room
    currentUsers: state.room.currentUsers,
})

export default connect(mapStateToProps ,{
    
})(UsersList);