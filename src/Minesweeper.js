import React, { Component } from "react";
import styled, { injectGlobal } from "styled-components";
import newGame from "./newGame";

injectGlobal`
  body {
    background: black;
    color: white;
    font-family: monospace;
    margin: 0;
    padding: 0;
  }
`;

const Button = styled.button`
  background: black;
  border: none;
  box-sizing: border-box;
  color: white;
  font-size: inherit;
  margin: 0;
  padding: 0;
  position: relative;

  :after {
    content: "";
    display: block;
    padding-bottom: 100%;
  }
`;

const Container = styled.div`
  display: grid;
  grid-template:
    "game info"
    "game newGame"
    / minmax(auto, 100vh) minmax(100px, auto);

  @media (orientation: portrait) {
    align-content: space-between;
    grid-template:
      "info" auto
      "game" 100vw
      "newGame" auto;
    min-height: 100vh;
  }
`;

const Content = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  position: absolute;
  width: 100%;
`;

const Game = styled.section`
  grid-area: game;
  position: relative;
  max-width: 100vh;

  :after {
    content: "";
    display: block;
    padding-bottom: 100%;
  }
`;

const Grid = styled.div`
  background: white;
  border: 1px solid white;
  box-sizing: border-box;
  display: grid;
  font-size: ${props => 100 / props.level / 2}vh;
  grid-gap: 1px;
  grid-template-columns: repeat(${props => props.level}, 1fr);
  grid-template-rows: repeat(${props => props.level}, 1fr);
  height: 100%;
  position: absolute;
  width: 100%;

  @media (orientation: portrait) {
    font-size: ${props => 100 / props.level / 2}vw;
  }
`;

const Info = styled.section`
  box-sizing: border-box;
  grid-area: info;
  padding: 2rem;

  > * {
    margin-top: 0;
  }

  @media (orientation: portrait) {
    padding: 1rem;
  }
`;

const NewGame = styled.section`
  box-sizing: border-box;
  grid-area: newGame;
  padding: 2rem;

  > * {
    margin-top: 0;
  }

  @media (orientation: portrait) {
    padding: 1rem;
  }
`;

const Revealed = styled.div`
  background: ${props =>
    props.value === "X" && props.gameOver ? "#E60000" : null};
  box-sizing: border-box;
  color: black;
  position: relative;

  :after {
    content: "";
    display: block;
    padding-bottom: 100%;
  }
`;

class Minesweeper extends Component {
  static defaultProps = {
    level: 10
  };

  state = {
    answers: newGame(this.props.level),
    gameOver: false,
    gameWon: false,
    level: this.props.level,
    levelNew: this.props.level,
    minesFlagged: 0,
    status: "So far, so good.",
    timer: 0,
    totalMines: Math.ceil(Math.pow(this.props.level, 2) / 8)
  };

  componentDidMount() {
    this.timer = setInterval(this.tick, 1000);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.gameOver && this.state.gameOver) {
      this.setState({ status: "Game over. Try again?" });
    }

    let count = Math.pow(this.state.level, 2) - this.state.totalMines;

    let minesFlagged = 0;
    for (let i = 0; i < this.state.answers.length; i++) {
      for (let j = 0; j < this.state.answers[i].length; j++) {
        if (
          this.state.answers[i][j].revealed &&
          this.state.answers[i][j].value !== "X"
        ) {
          count = count - 1;
        }

        if (this.state.answers[i][j].flagged) {
          minesFlagged = minesFlagged + 1;
        }
      }
    }

    if (
      minesFlagged !== this.state.minesFlagged &&
      prevState.minesFlagged !== this.state.minesFlagged
    ) {
      this.setState({ minesFlagged });
    }

    if (count === 0 && !prevState.gameWon) {
      clearInterval(this.timer);
      this.setState({ gameWon: true, status: "You won this one!" });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  changeLevel = e => {
    this.setState({ levelNew: parseInt(e.target.value, 10) });
  };

  clearZeros = location => {
    const answers = this.state.answers;
    const isBottom = answers[location[0] + 1] === undefined;
    const isLeft = answers[location[0]][location[1] - 1] === undefined;
    const isRight = answers[location[0]][location[1] + 1] === undefined;
    const isTop = answers[location[0] - 1] === undefined;

    if (!isBottom) {
      if (answers[location[0] + 1][location[1]].value !== "X") {
        this.reveal([location[0] + 1, location[1]]);
      }
      if (
        !isLeft &&
        answers[location[0] + 1][location[1] - 1].value !== "" &&
        answers[location[0] + 1][location[1] - 1].value !== "X"
      ) {
        this.reveal([location[0] + 1, location[1] - 1]);
      }
      if (
        !isRight &&
        answers[location[0] + 1][location[1] + 1].value !== "" &&
        answers[location[0] + 1][location[1] + 1].value !== "X"
      ) {
        this.reveal([location[0] + 1, location[1] + 1]);
      }
    }
    if (!isLeft) {
      if (answers[location[0]][location[1] - 1].value !== "X") {
        this.reveal([location[0], location[1] - 1]);
      }
    }
    if (!isRight) {
      if (answers[location[0]][location[1] + 1].value !== "X") {
        this.reveal([location[0], location[1] + 1]);
      }
    }
    if (!isTop) {
      if (answers[location[0] - 1][location[1]].value !== "X") {
        this.reveal([location[0] - 1, location[1]]);
      }
      if (
        !isLeft &&
        answers[location[0] - 1][location[1] - 1].value !== "" &&
        answers[location[0] - 1][location[1] - 1].value !== "X"
      ) {
        this.reveal([location[0] - 1, location[1] - 1]);
      }
      if (
        !isRight &&
        answers[location[0] - 1][location[1] + 1].value !== "" &&
        answers[location[0] - 1][location[1] + 1].value !== "X"
      ) {
        this.reveal([location[0] - 1, location[1] + 1]);
      }
    }
  };

  handleTurn = e => {
    const longPress = 500;
    const location = e.target
      .getAttribute("value")
      .split(",")
      .map(num => parseInt(num, 10));
    const startTime = e.timeStamp;
    const flagLocation = setTimeout(() => {
      let flaggedAnswers = this.state.answers;
      flaggedAnswers[location[0]][location[1]] = {
        ...flaggedAnswers[location[0]][location[1]],
        flagged: !flaggedAnswers[location[0]][location[1]].flagged
      };
      this.setState({
        answers: flaggedAnswers
      });
    }, longPress);

    const eventType = e.type === "mousedown" ? "mouseup" : "touchend";

    window.addEventListener(eventType, doneEvent => {
      if (doneEvent.timeStamp - startTime < longPress) {
        clearTimeout(flagLocation);
        this.reveal(location);
      }
      window.removeEventListener(eventType, function() {});
    });
  };

  reveal = location => {
    let answers = this.state.answers;
    const oldItem = answers[location[0]][location[1]];
    if (!oldItem.revealed) {
      const value = oldItem.value;
      answers[location[0]][location[1]] = {
        revealed: true,
        value
      };
      if (value === "X") {
        clearInterval(this.timer);
      }
      this.setState({ answers: answers, gameOver: value === "X" }, () => {
        if (value === "") {
          this.clearZeros(location);
        }
      });
    }
  };

  startGame = e => {
    e.preventDefault();
    this.setState({
      answers: newGame(this.state.levelNew),
      gameOver: false,
      gameWon: false,
      level: this.state.levelNew,
      minesFlagged: 0,
      status: "So far, so good.",
      timer: 0,
      totalMines: Math.ceil(Math.pow(this.state.levelNew, 2) / 8)
    });
  };

  tick = () => {
    this.setState({ timer: this.state.timer + 1 });
  };

  render() {
    return (
      <Container>
        <Info>
          <h1>Minesweeper</h1>
          <p>Level: {this.state.level}</p>
          <p>
            Mines Remaining: {this.state.totalMines - this.state.minesFlagged}
          </p>
          <p>Time: {this.state.timer}s</p>
          <p>{this.state.status}</p>
        </Info>
        <NewGame>
          <form onSubmit={this.startGame}>
            <h2>New Game</h2>
            <label>
              <input
                min="3"
                max="50"
                onChange={this.changeLevel}
                type="range"
                defaultValue={this.state.levelNew}
              />
              <br />
              Level: {this.state.levelNew}
            </label>
            <br />
            <br />
            <button type="submit" value="Submit">
              New Game
            </button>
          </form>
        </NewGame>
        <Game>
          <Grid level={this.state.level}>
            {this.state.answers.map((row, rowIndex) =>
              row.map(
                (item, colIndex) =>
                  item.revealed ||
                  this.state.gameWon ||
                  (this.state.gameOver && item.value === "X") ? (
                    <Revealed
                      key={`${rowIndex}-${colIndex}`}
                      level={this.state.level}
                      gameOver={this.state.gameOver}
                      value={item.value}
                    >
                      <Content>
                        {item.value === true ? "X" : item.value}
                      </Content>
                    </Revealed>
                  ) : (
                    <Button
                      disabled={this.state.gameOver}
                      key={`${rowIndex}-${colIndex}`}
                      onMouseDown={this.handleTurn}
                      onTouchStart={this.handleTurn}
                      value={[rowIndex, colIndex]}
                    >
                      <Content value={[rowIndex, colIndex]}>
                        {item.flagged ? "!" : null}
                      </Content>
                    </Button>
                  )
              )
            )}
          </Grid>
        </Game>
      </Container>
    );
  }
}

export default Minesweeper;
