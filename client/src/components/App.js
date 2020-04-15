import React from "react";
import LandingPage from './LandingPage/LandingPage';
import CollabPage from './CollabPage/CollabPage';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

function App() {

  return (
    <div id="main">
      <Router>
        <Switch>
          <Route exact path='/' component={LandingPage}/>
          <Route path='/collab' component={CollabPage}/>
        </Switch>
      </Router>
    </div>
  );
}

export default App;