import React, { Component } from "react";
import { db } from "../services/firebase";
import { Player } from "../components/Players";
import { getRandomPlayer } from "../helpers/utils";
import {
  Jumbotron,
  Input,
  Button,
  ListGroup,
  ListGroupItem,
  Progress,
} from "reactstrap";
export class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statement1: "",
      statement2: "",
      statement3: "",
      players: [],
      readError: null,
      writeError: null,
      playedPlayerIds: {},
      currentPlayer: null,
      guessStart: false,
      lieStatementNo: null,
      statement1Guess: 0,
      statement2Guess: 0,
      statement3Guess: 0,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleGuessStart = this.handleGuessStart.bind(this);
    this.handleSubmitLie = this.handleSubmitLie.bind(this);
    this.choosePlayer = this.choosePlayer.bind(this);
    this.handleGuess = this.handleGuess.bind(this);
  }

  async componentDidMount() {
    this.setState({ readError: null });
    try {
      db.ref("players").on("value", (snapshot) => {
        let players = [];
        let statement1Guess = 0;
        let statement2Guess = 0;
        let statement3Guess = 0;
        snapshot.forEach((snap) => {
          let player = snap.val();
          players.push(player);
          if (this.state.guessStart) {
            switch (player.currentGuess) {
              case "1":
                statement1Guess++;
                break;
              case "2":
                statement2Guess++;
                break;
              case "3":
                statement3Guess++;
                break;
              default:
                return;
            }
          }
        });
        players = players.sort((player1, player2) => parseInt(player2.totalCorrectGuess) - parseInt(player1.totalCorrectGuess) )
        this.setState({
          players,
          statement1Guess,
          statement2Guess,
          statement3Guess,
        });
      });
    } catch (error) {
      this.setState({ readError: error.message });
    }
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  }

  async handleGuessStart(event) {
    event.preventDefault();
    this.setState({ writeError: null });
    try {
      const {
        statement1,
        statement2,
        statement3,
        players,
        currentPlayer,
      } = this.state;
      const statements = {
        1: { value: statement1, id: 1 },
        2: { value: statement2, id: 2 },
        3: { value: statement3, id: 3 },
      };
      let updates = {};
      updates["/statements"] = statements;
      players.forEach((player) => {
        const updatedPlayer = {
          ...player,
          currentGuess: null,
          lockedGuess: false,
        };
        updates["/players/" + player.playerId] = updatedPlayer;
      });

      updates["/currentPlayer"] = currentPlayer;
      db.ref().update(updates);
      this.setState({
        guessStart: true,
      });
    } catch (error) {
      this.setState({ writeError: error.message });
    }
  }

  async handleSubmitLie() {
    this.setState({ writeError: null });
    try {
      const {
        statement1,
        statement2,
        statement3,
        players,
        lieStatementNo,
        playedPlayerIds,
        currentPlayer,
      } = this.state;
      const statements = {
        1: { value: statement1, id: 1, isLie: lieStatementNo == 1 },
        2: { value: statement2, id: 2, isLie: lieStatementNo == 2 },
        3: { value: statement3, id: 3, isLie: lieStatementNo == 3 },
      };
      let updates = {};
      updates["/statements"] = statements;
      players.forEach((player) => {
        const totalCorrectGuess =
          player.currentGuess == lieStatementNo
            ? parseInt(player.totalCorrectGuess) + 1
            : player.totalCorrectGuess;
        const updatedPlayer = { ...player, totalCorrectGuess };
        updates["/players/" + player.playerId] = updatedPlayer;
      });

      db.ref().update(updates);
      let newPlayedList = {
        ...playedPlayerIds,
        [currentPlayer.playerId]: true,
      };
      this.setState({
        currentPlayer: null,
        guessStart: false,
        playedPlayerIds: newPlayedList,
        lieStatementNo:null,
        statement1:"",
        statement2:"",
        statement3:"",
      });
    } catch (error) {
      this.setState({ writeError: error.message });
    }
  }

  choosePlayer() {
    const randomPlayer = getRandomPlayer(
      this.state.players,
      this.state.playedPlayerIds
    );
    this.setState({ currentPlayer: randomPlayer });
  }

  handleGuess(event) {
    this.setState({
      lieStatementNo: event.target.value,
    });
  }

  render() {
    const {
      statement1,
      statement2,
      statement3,
      error,
      writeError,
      currentPlayer,
      guessStart,
      lieStatementNo,
      players,
      statement1Guess,
      statement2Guess,
      statement3Guess,
      playedPlayerIds
    } = this.state;
    const totalPlayers = players.length - 1;
    const statement1Percentage =
      totalPlayers > 0 ? (100 * parseInt(statement1Guess)) / totalPlayers : 0;
    const statement2Percentage =
      totalPlayers > 0 ? (100 * parseInt(statement2Guess)) / totalPlayers : 0;
    const statement3Percentage =
      totalPlayers > 0 ? (100 * parseInt(statement3Guess)) / totalPlayers : 0;
    const gameOver = players.length > 0 && players.length == Object.keys(playedPlayerIds).length;
    return (
      <div>
        <Jumbotron className="admin-wrapper">
          <div className="statement-wrapper">
            {currentPlayer ? (
              <>
                <p className="h1">
                  <mark>{currentPlayer.name} </mark>statements are as follows:
                </p>
                <ListGroup>
                  <ListGroupItem
                    active={lieStatementNo == 1}
                    tag="label"
                    for="1"
                    action
                  >
                    <input
                      type="radio"
                      id="1"
                      name="guess"
                      value="1"
                      checked={lieStatementNo == 1}
                      onChange={this.handleGuess}
                      className="invisible"
                    ></input>

                    <Input
                      type="text"
                      onChange={this.handleChange}
                      name="statement1"
                      value={statement1}
                    />
                    {guessStart && (
                      <div className="progress-wrapper">
                        <Progress animated color="info" value={statement1Percentage}>
                          {statement1Percentage}%
                        </Progress>
                      </div>
                    )}
                  </ListGroupItem>
                  <ListGroupItem
                    active={lieStatementNo == 2}
                    tag="label"
                    for="2"
                    action
                  >
                    <input
                      type="radio"
                      id="2"
                      name="guess"
                      value="2"
                      checked={lieStatementNo == 2}
                      onChange={this.handleGuess}
                      className="invisible"
                    ></input>

                    <Input
                      type="text"
                      onChange={this.handleChange}
                      name="statement2"
                      value={statement2}
                    />
                    {guessStart && (
                      <div className="progress-wrapper">
                        <Progress animated color="info" value={statement2Percentage}>
                          {statement2Percentage}%
                        </Progress>
                      </div>
                    )}
                  </ListGroupItem>
                  <ListGroupItem
                    active={lieStatementNo == 3}
                    tag="label"
                    for="3"
                    action
                  >
                    <input
                      type="radio"
                      id="3"
                      name="guess"
                      value="3"
                      checked={lieStatementNo == 3}
                      onChange={this.handleGuess}
                      className="invisible"
                    ></input>

                    <Input
                      type="text"
                      onChange={this.handleChange}
                      name="statement3"
                      value={statement3}
                    />
                    {guessStart && (
                      <div className="progress-wrapper">
                        <Progress animated color="info" value={statement3Percentage}>
                          {statement2Percentage}%
                        </Progress>
                      </div>
                    )}
                  </ListGroupItem>
                </ListGroup>
                {error ? <p>{writeError}</p> : null}
                {guessStart ? (
                  <Button
                    color="primary"
                    size="lg"
                    active
                    onClick={this.handleSubmitLie}
                  >
                    Submit Lie
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    size="lg"
                    active
                    onClick={this.handleGuessStart}
                  >
                    Start Guess
                  </Button>
                )}
              </>
            ) : gameOver ? <div className="game-over">Game Over</div> :(
              <Button
                color="primary"
                size="lg"
                active
                onClick={this.choosePlayer}
              >
                Choose the Player
              </Button>
            )}
          </div>
          <div className="players-list">
            <Player players={this.state.players} />
          </div>
        </Jumbotron>
      </div>
    );
  }
}
