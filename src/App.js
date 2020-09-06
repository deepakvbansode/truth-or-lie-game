import React from "react";
import "./App.css";

import { Home } from "./pages/Home";
import { Admin } from "./pages/Admin";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
 

function App() {
  return <Router>
  <Switch>
    <Route exact path="/truth-or-lie-game" component={Home}></Route>
    <Route path="/truth-or-lie-game/admin" component={Admin}></Route>
  </Switch>
</Router>
}

export default App;
