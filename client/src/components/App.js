import React from "react";
import LandingPage from './LandingPage/LandingPage';
import CollabPage from './CollabPage/CollabPage';
import InvalidRoomCodePage from './InvalidRoomCodePage/InvalidRoomCodePage'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

function App() {

  return (
    <div id="main">
      <Router>
        <Switch>
          <Route exact path='/' component={LandingPage}/>
          <Route path='/collab' component={CollabPage}/>
          <Route path='/invalid-room-code' component={InvalidRoomCodePage}/>
        </Switch>
      </Router>
    </div>
  );
}

export default App;