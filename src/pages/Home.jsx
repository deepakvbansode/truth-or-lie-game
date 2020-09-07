import React, { Component } from "react";
import { db } from "../services/firebase";
import {
  Jumbotron,
  Alert,
  Button,
  ListGroup,
  ListGroupItem,
  Label,
  FormGroup,
  Input,
} from "reactstrap";

const PLAYER_NAME = "player-name";

export class Home extends Component {
  constructor(props) {
    super(props);
    const playerId = localStorage.getItem(PLAYER_NAME);
    this.state = {
      statements: [],
      guess: null,
      readError: null,
      writeError: null,
      playerName: "",
      playerId,
      playerInfo: null,
      currentPlayer: null,
      resultDeclare: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.submitGuess = this.submitGuess.bind(this);
    this.handleGuess = this.handleGuess.bind(this);
    this.listenForPlayer = this.listenForPlayer.bind(this);
  }

  async componentDidMount() {
    this.setState({ readError: null });
    if (this.state.playerId) {
      this.listenForPlayer(this.state.playerId);
    }
    try {
      db.ref("statements").on("value", (snapshot) => {
        let statements = [];
        snapshot.forEach((snap) => {
          statements.push(snap.val());
        });
        let resultDeclare = statements.some((statement) => statement.isLie);
        this.setState({ statements, resultDeclare });
      });
      db.ref("currentPlayer").on("value", (snapshot) => {
        const currentPlayer = snapshot.val();
        this.setState({ currentPlayer });
      });
    } catch (error) {
      this.setState({ readError: error.message });
    }
  }

  async listenForPlayer(playerId) {
    try {
      db.ref("players/" + playerId).on("value", (snapshot) => {
        let playerInfo = snapshot.val();
        this.setState({ playerInfo, guess: playerInfo.currentGuess });
      });
      db.ref("players/");
    } catch (error) {
      this.setState({ readError: error.message });
    }
  }

  handleChange(event) {
    this.setState({
      playerName: event.target.value,
    });
  }

  handleGuess(event) {
    this.setState({
      guess: event.target.value,
    });
  }

  async submitGuess() {
    const { guess, playerId } = this.state;
    this.setState({ writeError: null });
    try {
      await db.ref("players/" + playerId).update({
        currentGuess: guess,
        lockedGuess: true,
      });
    } catch (error) {
      this.setState({ writeError: error.message });
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ writeError: null });
    try {
      const playerId = db.ref().child("players").push().key;
      await db.ref("players/" + playerId).set({
        playerId: playerId,
        name: this.state.playerName,
        currentGuess: null,
        totalCorrectGuess: 0,
        timestamp: Date.now(),
      });

      this.setState({ playerName: "", playerId });
      localStorage.setItem(PLAYER_NAME, playerId);
      this.listenForPlayer(playerId);
    } catch (error) {
      this.setState({ writeError: error.message });
    }
  }
  render() {
    const {
      statements,
      playerId,
      playerName,
      error,
      writeError,
      guess,
      playerInfo,
      currentPlayer,
      resultDeclare,
    } = this.state;
    let alertColor = "";
    let alertMessage = "";
    if (resultDeclare) {
      const correctStatement = statements.find((statement) => statement.isLie);
      if (guess == correctStatement.id) {
        alertColor = "success";
        alertMessage = "Great.....you guessed it!";
      } else {
        alertColor = "danger";
        alertMessage = "Better luck next time!";
      }
    }
    return (
      <div>
        <Jumbotron>
          {playerId ? (
            <div className="player-wrapper">
              {statements.length === 0 && <div>Game will begin soon...</div>}
              {resultDeclare && (
                <Alert color={alertColor}>{alertMessage}</Alert>
              )}
              {currentPlayer && (
                <>
                  <p>{currentPlayer.name}'s lie is:</p>
                  <ListGroup>
                    {statements.map((statement) => {
                      return (
                        <ListGroupItem
                          active={guess == statement.id}
                          key={statement.id}
                          tag="label"
                          for={statement.id}
                          action
                          disabled={
                            (currentPlayer &&
                              currentPlayer.playerId == playerId) ||
                            (playerInfo ? playerInfo.lockedGuess : false)
                          }
                        >
                          <input
                            type="radio"
                            id={statement.id}
                            name="guess"
                            value={statement.id}
                            checked={guess == statement.id}
                            onChange={this.handleGuess}
                            className="invisible"
                          ></input>
                          <label for={statement.id}>{statement.value}</label>
                        </ListGroupItem>
                      );
                    })}
                  </ListGroup>
                </>
              )}
              {currentPlayer && currentPlayer.playerId == playerId ? (
                <div>You cannot guess...these are your statements</div>
              ) : statements.length != 0 &&  (
                <Button
                  color="primary"
                  size="lg"
                  active
                  onClick={this.submitGuess}
                  disabled={playerInfo ? playerInfo.lockedGuess : false}
                >
                    {playerInfo && playerInfo.lockedGuess ? `Your guess is submitted` : `Submit Guess`}
                  
                </Button>
              )}
            </div>
          ) : (
            <form onSubmit={this.handleSubmit}>
              <FormGroup>
                <Label for="userName">What is your good name?</Label>
                <Input
                  type="text"
                  name="name"
                  id="userName"
                  placeholder="Name"
                  onChange={this.handleChange}
                  value={playerName}
                />
              </FormGroup>

              {error ? <p>{writeError}</p> : null}

              <Button color="primary" size="lg" active type="submit" disabled={!playerName}>
                Start Playing
              </Button>
            </form>
          )}
        </Jumbotron>
      </div>
    );
  }
}
