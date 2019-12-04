import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import LoginView from './LoginView';
import LoggedView from './LoggedView';
import ResetPassword from './ResetPassword';

const Routes = () => (
  <div>
      <BrowserRouter>
    <Switch>
      <Route exact path="/" component={LoginView} />
      <Route exact path="/login" component={LoginView} />
      <Route exact path="/reset/:token" component={ResetPassword} />
      <Route exact path="/userProfile/:username" component={LoggedView} />      
    </Switch>
    </BrowserRouter>
  </div>
);

export default Routes;