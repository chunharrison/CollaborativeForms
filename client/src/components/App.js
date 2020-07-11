import React from "react";
import LandingPage from './LandingPage/LandingPage'
import InvalidRoomCodePage from './CollabPage/InvalidRoomCodePage/InvalidRoomCodePage'
import CollabPage from './CollabPage/CollabPage'
import DocumentsPage from './DocumentsPage/DocumentsPage'
import NewLandingPage from './NewLandingPage/NewLandingPage'
import PrivateRoute from './private-route/PrivateRoute'
import GuestJoin from './GuestJoin/GuestJoin'

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Provider } from "react-redux"
import store from "../store"

import jwt_decode from "jwt-decode";
import setAuthToken from "../utils/setAuthToken";
import { setCurrentUser, logoutUser } from "../actions/authActions";
import SignInOrUp from "./SignInOrUp/SignInOrUp";

// import PrivateRoute from "./components/private-route/PrivateRoute";
// import Dashboard from "./components/dashboard/Dashboard";

// dev
// import UploadComponent from './UploadComponent/UploadComponent'
// import DownloadComponent from './DownloadComponent/DownloadComponent'

// Check for token to keep user logged in
if (localStorage.jwtToken) {
  // Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);
  // Decode token and get user info and exp
  const decoded = jwt_decode(token);
  // Set user and isAuthenticated
  console.log(decoded)
  store.dispatch(setCurrentUser(decoded));
// Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
    // Redirect to login
    window.location.href = "./account";
  }
}

function App() {

  return (
    <div id="main">
      <Provider store={store}>
        <Router>
          <Route exact path='/' component={NewLandingPage}/>
          <Route path='/collab' component={CollabPage}/>
          <Route path='/invalid-room-code' component={InvalidRoomCodePage}/>
          <Route exact path='/account' component={SignInOrUp} />
          <Route path='/component-testing' component={DocumentsPage}/>
          <Switch>
            <PrivateRoute exact path='/account-portal' component={DocumentsPage}/>
          </Switch>
          <Route path='/test' component={LandingPage}/>
          <Route path='/join-room' component={GuestJoin}/>
        </Router>
      </Provider>
    </div>
  );
}

export default App;