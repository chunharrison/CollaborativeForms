import socketIOClient from 'socket.io-client';

const socket = socketIOClient("http://127.0.0.1:4001");

export default socket;


import React, {Component} from "react";
import socket from "./socket-config";

class App extends Component {
  constructor(props) {
      super(props);
      this.state = {
          value: 0
      };

      this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    //Listen for data on the "outgoing data" namespace and supply a callback for what to do when we get one. In this case, we set a state variable
    socket.on("outgoing data", data => this.setState({value: data.val}));
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    socket.emit('incoming data', event.target.value);
  }

  render() {
    return (
      <input
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
        />
    );
  }
}

export default App;