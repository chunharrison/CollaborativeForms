import React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import linkImg from './link.png'

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
                <CopyToClipboard 
                    className='tool'
                    text={this.props.roomCode}
                    onCopy={() => this.setState({copied: true}, () => {
                        window.setTimeout(() => {
                            this.setState({copied: false})
                        }, 2000)
                    })}>
                        <div>
                            <img src={linkImg}></img>
                        </div>
                </CopyToClipboard>
        )
    }
}

export default CopyRoomCode