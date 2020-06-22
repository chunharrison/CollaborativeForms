import React from "react";
import LandingPage from './LandingPage/LandingPage'
import InvalidRoomCodePage from './InvalidRoomCodePage/InvalidRoomCodePage'
import CollabPage from './CollabPage/CollabPage'
import NewLandingPage from './NewLandingPage/NewLandingPage'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Provider } from "react-redux"
import store from "../store"

import jwt_decode from "jwt-decode";
import setAuthToken from "../utils/setAuthToken";
import { setCurrentUser, logoutUser } from "../actions/authActions";

import Login from './Login/Login'
import Register from './Register/Register'
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
  store.dispatch(setCurrentUser(decoded));
// Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
    // Redirect to login
    window.location.href = "./login";
  }
}

function App() {

  return (
    <div id="main">
      <Provider store={store}>
      <Router>
        <Switch>
          <Route exact path='/' component={LandingPage}/>
          <Route path='/collab' component={CollabPage}/>
          <Route path='/invalid-room-code' component={InvalidRoomCodePage}/>
          <Route exact path='/register' component={Register}/>
          <Route exact path='/login' component={Login}/>
          <Route path='/component-testing' component={NewLandingPage}/>
          <Route exact path='/account' component={SignInOrUp} />
        </Switch>
      </Router>
      </Provider>
    </div>
  );
}

export default App;