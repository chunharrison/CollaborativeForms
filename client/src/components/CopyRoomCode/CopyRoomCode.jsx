import React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';

class CopyRoomCode extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            copied: false,
            showOverlay: false
        }
    }
    render() {

        const popover = <Popover><Popover.Content>Copied!</Popover.Content></Popover>
        return (
            <div>
                <h3>Room Code: {this.props.roomCode}</h3>
                <CopyToClipboard 
                    text={this.props.roomCode}
                    onCopy={() => this.setState({copied: true}, () => {
                        window.setTimeout(() => {
                            this.setState({copied: false})
                        }, 3000)
                    })}>
                        <OverlayTrigger trigger="click" placement="right" overlay={popover}>
                            <Button>
                                Copy Room Code
                            </Button>
                        </OverlayTrigger>
                </CopyToClipboard>
            </div>
        )
    }
}

export default CopyRoomCode