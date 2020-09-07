import React from "react";
import "./App.css";
import {Alert} from "reactstrap";
import { Home } from "./pages/Home";
import { Admin } from "./pages/Admin";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

function App() {
  return (
    <div>
      <Alert color="primary">

      <h1>Welcome to Frontdoor's Cross Functional Team Game zone! </h1>
      </Alert>
    <Router>
      <Switch>
        <Route exact path="/truth-or-lie-game" component={Home}></Route>
        <Route path="/truth-or-lie-game/admin" component={Admin}></Route>
      </Switch>
    </Router>
    </div>
  );
}

export default App;
