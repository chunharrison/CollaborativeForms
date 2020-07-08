import React, { useState } from 'react'

// Redux
import { connect } from 'react-redux';

// Components
// import Dropdown from 'react-bootstrap/Dropdown';
// import Badge from 'react-bootstrap/Badge';
import { Dropdown } from 'semantic-ui-react'

import usersImg from './users.png'

const UsersList = (props) => {
    
    const [currentGuests, setCurrentGuests] = useState(props.currentGuests)

    const friendOptions = [
        {
          key: 'Jenny Hess',
          text: 'Jenny Hess',
          value: 'Jenny Hess',
          image: { avatar: true, src: 'https://react.semantic-ui.com/images/avatar/small/jenny.jpg' },
        },
        {
          key: 'Elliot Fu',
          text: 'Elliot Fu',
          value: 'Elliot Fu',
          image: { avatar: true, src: 'https://react.semantic-ui.com/images/avatar/small/elliot.jpg' },
        },
        {
          key: 'Stevie Feliciano',
          text: 'Stevie Feliciano',
          value: 'Stevie Feliciano',
          image: { avatar: true, src: 'https://react.semantic-ui.com/images/avatar/small/stevie.jpg' },
        },
      ]
      
    return (
        // <Dropdown drop='up'>
        //     <Dropdown.Toggle>
        //         Users  <Badge variant="light">{Object.keys(props.currentUsers).length}</Badge>
        //     </Dropdown.Toggle>
        //     <Dropdown.Menu>
        //         {Object.entries(props.currentUsers).map(([socketid, username], i) => (
        //             <Dropdown.Item>{username}</Dropdown.Item>
        //         ))}
        //     </Dropdown.Menu>
        // </Dropdown>
    //     <div className='tool'>
    //         <Dropdown text='Users'
    // floating
    // labeled
    // button>
    //             <Dropdown.Menu>
    //                 <Dropdown.Header content='Host'/>
    //                 {/* <Dropdown.Item key={props.host.id} {...props.host} /> */}
    //                 {friendOptions.map((option) => (
    //                     <Dropdown.Item key={option.value} {...option} />
    //                 ))}
    //                 {/* <Dropdown.Header content='Guests'/> */}
    //                 {/* {currentGuests.map((guest) => (
    //                     <Dropdown.Item key={guest.id} {...props.host} />
    //                 ))} */}
    //             </Dropdown.Menu>
    //         </Dropdown>
    //     </div>
    <Dropdown
    icon='user'
    floating
    labeled
    button
    className='icon'
        >
            <Dropdown.Menu>
            <Dropdown.Header content='People You Might Know' />
            {friendOptions.map((option) => (
                <Dropdown.Item key={option.value} {...option} />
            ))}
            </Dropdown.Menu>
        </Dropdown>
    )
}

const mapStateToProps = state => ({
    // room
    // host: state.room.host,
    // currentGuests: state.room.currentUsers,
})

export default connect(mapStateToProps ,{
    
})(UsersList);