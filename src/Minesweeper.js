import React, { Component } from "react";
import styled, { injectGlobal } from "styled-components";
import newGame from "./newGame";
import surroundings from "./surroundings";

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

const initialState = {
  gameOver: false,
  gameWon: false,
  minesFlagged: 0,
  turn: 0,
  status: "So far, so good.",
  timer: 0
};

class Minesweeper extends Component {
  static defaultProps = {
    level: 50
  };

  state = {
    ...initialState,
    answers: newGame(this.props.level),
    level: this.props.level,
    levelNew: this.props.level,
    totalMines: Math.ceil(Math.pow(this.props.level, 2) / 8)
  };

  componentDidMount() {
    this.timer = setInterval(this.tick, 1000);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.turn === prevState.turn) {
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
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  changeLevel = e => {
    this.setState({ levelNew: parseInt(e.target.value, 10) });
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

        this.setState({
          ...this.reveal(this.state.answers, location),
          turn: this.state.turn + 1
        });
      }
      window.removeEventListener(eventType, function() {});
    });
  };

  reveal = (answers, location) => {
    let newAnswers = answers;
    const item = newAnswers[location[0]][location[1]];
    newAnswers[location[0]][location[1]] = {
      ...item,
      revealed: true
    };

    if (item.value === "") {
      let adjacents = surroundings(answers, location[0], location[1]);
      Object.values(adjacents).forEach(cell => {
        if (cell.value !== undefined && cell.value !== "X") {
          if (cell.value === "" && !cell.revealed) {
            newAnswers = this.reveal(newAnswers, [cell.y, cell.x]).answers;
          }

          newAnswers[cell.y][cell.x] = {
            ...cell,
            revealed: true
          };
        }
      });
    }

    let gameOver = {};
    if (item.value === "X") {
      clearInterval(this.timer);
      gameOver = {
        gameOver: true,
        status: "Game over. Try again?"
      };
    }

    return {
      answers,
      ...gameOver
    };
  };

  startGame = e => {
    e.preventDefault();
    this.setState({
      ...initialState,
      answers: newGame(this.props.level),
      level: this.state.levelNew,
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
