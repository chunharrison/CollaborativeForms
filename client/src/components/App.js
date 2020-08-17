import React from "react";
import LandingPage from './LandingPage/LandingPage';
import InvalidRoomCodePage from './CollabPage/InvalidRoomCodePage/InvalidRoomCodePage';
import CollabPage from './CollabPage/CollabPage';
import DemoPage from './DemoPage/DemoPage'
import DocumentsPage from './DocumentsPage/DocumentsPage';
import PrivateRoute from './private-route/PrivateRoute';
import GuestJoin from './GuestJoin/GuestJoin';
import CommentsPanel from './CommentsPanel/CommentsPanel';
import ContactUs from './ContactUs/ContactUs'
import VerifyEmail from './VerifyEmail/VerifyEmail'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Provider } from "react-redux";
import store from "../store";

import jwt_decode from "jwt-decode";
import setAuthToken from "../utils/setAuthToken";
import { setCurrentUser, logoutUser } from "../actions/authActions";
import Login from "./Login/Login";
import Register from "./Register/Register";
import ForgotPassword from './ForgotPassword/ForgotPassword';
import ResetPassword from "./ResetPassword/ResetPassword";
import AccountPortal from "./AccountPortal/AccountPortal";
import Test from "./test/test";
import GoogleLoginCallback from "./GoogleLoginCallback/GoogleLoginCallback";

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
    window.location.href = "./account";
  }
}

function App() {

  return (
    <div id="main">
      <Provider store={store}>
        <Router>
          <Route exact path='/' component={LandingPage}/>
          <Route path='/collab' component={CollabPage}/>
          <Route exact path='/login' component={Login} />
          <Switch>
            <Route exact path='/register' component={Register} />
          </Switch>
          <Switch>
            <PrivateRoute exact path='/account-portal' component={AccountPortal}/>
          </Switch>
          <Route path='/component-testing' component={CommentsPanel}/>
          <Route path='/join-room' component={GuestJoin}/>
          <Route path='/reset' component={ResetPassword}/>
          <Route path='/forgot' component={ForgotPassword}/>
          <Route path='/demo' component={DemoPage}/>
          <Route path='/contact-us' component={ContactUs}/>
          <Route path='/verify' component={VerifyEmail}/>
          <Route path='/test' component={Test}/>
          <Route path='/google-login-callback' component={GoogleLoginCallback}/>

          {/* ERROR PAGES */}
          <Route path='/invalid-room-code' component={InvalidRoomCodePage}/>
        </Router>
      </Provider>
    </div>
  );
}

export default App;