import React from "react";
import LandingPage from './LandingPage/LandingPage';
import InvalidRoomCodePage from './InvalidRoomCodePage/InvalidRoomCodePage'
import CollabPage from './CollabPage/CollabPage'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// dev
// import UploadComponent from './UploadComponent/UploadComponent'
// import DownloadComponent from './DownloadComponent/DownloadComponent'

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