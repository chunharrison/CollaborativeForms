import React, { useState, useEffect } from 'react'

// Libraries
import axios from 'axios'

// Redux
import { connect } from 'react-redux';

// Components
// import Dropdown from 'react-bootstrap/Dropdown';
// import Badge from 'react-bootstrap/Badge';
import { Dropdown } from 'semantic-ui-react'

import usersImg from './users.png'

const UsersList = (props) => {
    const avatarImages = [
      'ade.jpg',
      'chris.jpg',
      'christian.jpg',
      'daniel.jpg',
      'elliot.jpg',
      'helen.jpg',
      'jenny.jpg',
      'joe.jpg',
      'justen.jpg',
      'laura.jpg',
      'lena.png',
      'lindsay.png',
      'mark.png',
      'matt.jpg',
      'matthew.png',
      'molly.png',
      'nan.jpg',
      'nom.jpg',
      'rachel.png',
      'steve.jpg',
      'stevie.jpg',
      'tom.jpg',
      'veronika.jpg',
      'zoe.jpg'
    ]
    const avatarImageURL = 'https://react.semantic-ui.com/images/avatar/small/'

    const [currentGuests, setCurrentGuests] = useState(props.currentGuests)
    const [currentGuestsDropdownOptions, setCurrentGuestsDropdownOptions] = useState(props.guests.map(userName => {
        return {
          key: userName,
          text: userName,
          value: userName,
          image: avatarImageURL+avatarImages[Math.floor(Math.random()*avatarImages.length)]
        }
    }))
    
    // useEffect(() => {
      
    //   if (props.guests !== currentGuests) {
    //     setCurrentGuests(props.guests.map(guestName => {
    //       return {
    //         key: guestName,
    //         text: guestName,
    //         value: guestName,
    //         image: avatarImageURL+avatarImages[Math.floor(Math.random()*avatarImages.length)]
    //       }
    //   }))
    //   }
    // })

    return (
      <Dropdown
        icon='user'
        floating
        labeled
        button
        className='icon'>
          <Dropdown.Menu>
              <Dropdown.Header content='Host' />
              <Dropdown.Item 
                key={props.hostName} 
                text={props.hostName} 
                value={props.hostName}
                />
              <Dropdown.Header content='Guests' />
              {currentGuestsDropdownOptions.map((option) => (
                <Dropdown.Item key={option.value} {...option} />
              ))}
          </Dropdown.Menu>
        </Dropdown>
    )
}

const mapStateToProps = state => ({
    // room
    roomCode: state.room.roomCode,
    guests: state.room.guests,
    hostName: state.room.hostName,
})

export default connect(mapStateToProps ,{
    
})(UsersList);