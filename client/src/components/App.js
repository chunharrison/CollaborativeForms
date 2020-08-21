import React from "react";
import LandingPage from './LandingPage/LandingPage';
import InvalidRoomCodePage from './CollabPage/InvalidRoomCodePage/InvalidRoomCodePage';
import CollabPage from './CollabPage/CollabPage';
import DemoPage from './DemoPage/DemoPage'
import PrivateRoute from './private-route/PrivateRoute';
import GuestJoin from './GuestJoin/GuestJoin';
import CommentsPanel from './CommentsPanel/CommentsPanel';
import ContactUs from './ContactUs/ContactUs'
import VerifyEmail from './VerifyEmail/VerifyEmail'
import Payment from './Payment/Payment'
import ChangePlan from './Payment/ChangePlan'
import UpdatePayment from './Payment/UpdatePayment'
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
import LoginCallback from "./LoginCallback/LoginCallback";
import FacebookEmailError from "./LoginCallback/FacebookEmailError";
import SubscriptionPlans from "./SubscriptionPlans/SubscriptionPlans";

//stripe
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_API_KEY);

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
        <Elements stripe={stripePromise}>
          <Router>
            <Route exact path='/' component={LandingPage}/>
            <Route path='/collab' component={CollabPage}/>
            <Route exact path='/login' component={Login} />
            <Route exact path='/register' component={Register} />
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
            <Route exact path='/payment' component={Payment}/>
            <Route exact path='/payment/change' component={ChangePlan}/>
            <Route exact path='/payment/update-payment' component={UpdatePayment}/>
            <Route path='/test' component={Test}/>
            <Route path='/login-callback' component={LoginCallback}/>
            <Route path='/facebook-email-error' component={FacebookEmailError}/>
            <Route path='/subscriptions' component={SubscriptionPlans}/>
            {/* ERROR PAGES */}
            <Route path='/invalid-room-code' component={InvalidRoomCodePage}/>
          </Router>
        </Elements>
      </Provider>
    </div>
  );
}

export default App;