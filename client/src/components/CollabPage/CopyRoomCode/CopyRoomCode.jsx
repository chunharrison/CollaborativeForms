import React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip'

class CopyRoomCode extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            copied: false,
            showOverlay: false
        }

        this.copyButton = React.createRef();
    }
    render() {
        
        return (
            <div className='clipboard-container'>
                <h3>Room Code: {this.props.roomCode}</h3>
                <CopyToClipboard 
                    text={this.props.roomCode}
                    onCopy={() => this.setState({copied: true}, () => {
                        window.setTimeout(() => {
                            this.setState({copied: false})
                        }, 2000)
                    })}>
                        <Button className='clipboard-button' ref={this.copyButton}>
                            <img className='clipboard-button-icon' src='/clipboard.png'></img>
                        </Button>
                </CopyToClipboard>
                <Overlay target={this.copyButton.current} show={this.state.copied} placement='right'>
                    <Tooltip>Copied!</Tooltip>
                </Overlay>
            </div>
        )
    }
}

export default CopyRoomCode