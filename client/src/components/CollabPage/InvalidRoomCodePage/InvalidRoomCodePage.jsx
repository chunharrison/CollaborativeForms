import React from 'react';

//CSS
import './InvalidRoomCodePage.css';

class InvalidRoomCodePage extends React.Component {
    render () {
        return (
            <div className="invalid-room-code">
                <div className="error-code-div">
                    <h1 className="error-code">
                        404
                        <br/><br/><br/>
                    </h1>
                </div>
                <div className="warning-message-div">
                    <h1 className="warning-message">
                        A room corresponding to the code given does not exist.
                    </h1>
                </div>
            </div>
        )
    }
}

export default InvalidRoomCodePage;