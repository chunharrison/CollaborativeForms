import React from 'react';

class InvalidRoomCodePage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }


    render () {
        return (
            <div className="invalid-room-code-page">
                <h2>
                    A room corresponding to the code given does not exist :(
                    Please make sure that you have a correct room code. 
                </h2>
            </div>
        )
    }
}

export default InvalidRoomCodePage;