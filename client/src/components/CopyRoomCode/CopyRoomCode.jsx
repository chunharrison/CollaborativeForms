import React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';

class CopyRoomCode extends React.Component {
    constructor(...props) {
        super(...props)
        this.attachRef = target => this.setState({ target });
        this.state = {
            copied: false,
            showOverlay: false
        }
    }
    render() {

        const popover = <Popover><Popover.Content>Room Code Copied!</Popover.Content></Popover>
        const {showOverlay, target} = this.state
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
                        <Button
                            variant="danger"
                            ref={this.attachRef}
                            onClick={() => this.setState({ showOverlay: !showOverlay }, () => {
                                window.setTimeout(() => {
                                    this.setState({showOverlay: false})
                                }, 3000)})}
                        >
                            Copy Room Code
                        </Button>
                        <Overlay target={target} show={showOverlay} placement="right">
                            {({ placement, scheduleUpdate, arrowProps, ...props }) => (
                                <div
                                    {...props}
                                    style={{
                                        backgroundColor: 'rgba(255, 100, 100, 0.85)',
                                        padding: '2px 10px',
                                        color: 'white',
                                        borderRadius: 3,
                                        ...props.style,
                                    }}
                                >
                                    Simple tooltip
                                </div>
                            )}
                            </Overlay>
                </CopyToClipboard>
            </div>
        )
    }
}

export default CopyRoomCode