import React from "react";
import PDFSelectPage from './PDFSelectPage';
import CollabPage from './CollabPage';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

function App() {

  return (
    <div id="main">
      <Router>
        <Switch>
          <Route path='/' exact component={PDFSelectPage}/>
          <Route path='/collab' exact component={CollabPage}/>
        </Switch>
      </Router>
    </div>
  );
}

export default App;