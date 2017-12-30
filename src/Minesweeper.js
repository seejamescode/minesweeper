import React, { Component } from "react";
import styled, { injectGlobal } from "styled-components";
import { newGame, reveal } from "./functions";
import {
  InputCheckbox,
  InputRange,
  InputSubmit,
  InputTab,
  InputTabs
} from "./inputs";
import { celebration, shake } from "./keyframes";

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
    / minmax(auto, 100vh) 14.5rem;

  @media (orientation: portrait) {
    align-content: space-between;
    grid-template:
      "info" auto
      "game" 100vw;
    height: 100vh;
    overflow: hidden;
  }
`;

const Content = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  user-select: none;
  position: absolute;
  width: 100%;
`;

const Game = styled.section`
  animation: ${props => (props.gameOver ? shake : null)} 0.82s
    cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  backface-visibility: hidden;
  grid-area: game;
  position: relative;
  max-width: 100vh;
  perspective: 1000px;
  transform: translate3d(0, 0, 0);

  :after {
    content: "";
    display: block;
    padding-bottom: 100%;
  }
`;

const Grid = styled.div`
  animation: ${celebration} 6s ease infinite;
  background: ${props =>
    props.gameWon
      ? "linear-gradient(230deg, #ee3490, #fbf007, #35fd0b, #0085fe, #9d3cd3, #ee3490, #fbf007, #35fd0b, #0085fe, #9d3cd3)"
      : "white"};
  background-size: 2000% 2000%;
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

const Info = styled.div`
  box-sizing: border-box;
  grid-area: info;

  * {
    margin-top: 0;
  }

  @media (orientation: portrait) {
    overflow-y: auto;
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

const Section = styled.section`
  display: ${props => (!props.show ? "none" : null)};
  max-width: 14.5rem;
  padding: 1rem;
`;

const Title = styled.h1`
  margin: 0;
  padding: 1rem;
`;

class Minesweeper extends Component {
  static defaultProps = {
    flagMode: false,
    gameOver: false,
    gameWon: false,
    level: 10,
    minesFlagged: 0,
    tab: 0,
    turn: 0,
    status: "So far, so good.",
    timer: 0
  };

  state = {
    ...this.props,
    answers: newGame(this.props.level),
    levelNew: this.props.level,
    totalMines: Math.ceil(Math.pow(this.props.level, 2) / 8)
  };

  componentDidMount() {
    this.timer = setInterval(this.tick, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  changeFlagMode = e => {
    this.setState({ flagMode: !this.state.flagMode });
  };

  changeLevel = e => {
    this.setState({ levelNew: parseInt(e.target.value, 10) });
  };

  changeTab = e => {
    this.setState({ tab: parseInt(e.target.value, 10) });
  };

  handleFlag = location => {
    let flaggedAnswers = this.state.answers;
    flaggedAnswers[location[0]][location[1]] = {
      ...flaggedAnswers[location[0]][location[1]],
      flagged: !flaggedAnswers[location[0]][location[1]].flagged
    };
    this.setState({
      answers: flaggedAnswers,
      minesFlagged: flaggedAnswers[location[0]][location[1]].flagged
        ? this.state.minesFlagged + 1
        : this.state.minesFlagged - 1
    });
  };

  handleTurn = e => {
    const location = e.target
      .getAttribute("value")
      .split(",")
      .map(num => parseInt(num, 10));

    if (this.state.flagMode) {
      this.handleFlag(location);
    } else {
      const answers = reveal(this.state.answers, location);

      // Check if game is won or lost
      let count = Math.pow(this.state.level, 2) - this.state.totalMines;
      let gameWon = {};
      let gameOver = {};
      let current = {};
      for (let i = 0; i < answers.length; i++) {
        for (let j = 0; j < answers.length; j++) {
          current = answers[i][j];
          count = current.revealed ? count - 1 : count;
          if (current.revealed && current.value === "X") {
            clearInterval(this.timer);
            gameOver = {
              gameOver: true,
              status: (
                <React.Fragment>
                  Game over.<br />
                  <br />
                  <InputSubmit onClick={this.startGame}>Try again?</InputSubmit>
                </React.Fragment>
              )
            };
          }
        }
      }

      if (count === 0) {
        clearInterval(this.timer);
        gameWon = { gameWon: true, status: "You won this one!" };
      }

      this.setState({
        answers,
        ...gameOver,
        ...gameWon,
        turn: this.state.turn + 1
      });
    }
  };

  startGame = e => {
    e.preventDefault();
    this.setState({
      ...this.props,
      answers: newGame(this.state.levelNew),
      level: this.state.levelNew,
      totalMines: Math.ceil(Math.pow(this.state.levelNew, 2) / 8)
    });
    this.timer = setInterval(this.tick, 1000);
  };

  tick = () => {
    this.setState({ timer: this.state.timer + 1 });
  };

  render() {
    return (
      <Container>
        <Info>
          <Title>Minesweeper</Title>
          <InputTabs>
            <InputTab checked={this.state.tab === 0}>
              <input
                checked={this.state.tab === 0}
                name="tab"
                onChange={this.changeTab}
                tab={this.state.tab}
                type="radio"
                value={0}
              />Game
            </InputTab>
            <InputTab checked={this.state.tab === 1}>
              <input
                checked={this.state.tab === 1}
                name="tab"
                onChange={this.changeTab}
                tab={this.state.tab}
                type="radio"
                value={1}
              />New
            </InputTab>
            <InputTab checked={this.state.tab === 2}>
              <input
                checked={this.state.tab === 2}
                name="tab"
                onChange={this.changeTab}
                tab={this.state.tab}
                type="radio"
                value={2}
              />Scores
            </InputTab>
          </InputTabs>
          <Section show={this.state.tab === 0}>
            <p>Level: {this.state.level}</p>
            <p>
              Mines Remaining: {this.state.totalMines - this.state.minesFlagged}
            </p>
            <p>Time: {this.state.timer}s</p>
            <InputCheckbox>
              Flag Mode
              <input
                onChange={this.changeFlagMode}
                type="checkbox"
                value={this.state.flagMode}
              />
              <div>!</div>
            </InputCheckbox>
            <br />
            <p>{this.state.status}</p>
          </Section>
          <Section show={this.state.tab === 1}>
            <label>
              <p>Level: {this.state.levelNew}</p>
              <InputRange
                min="3"
                max="50"
                onChange={this.changeLevel}
                type="range"
                defaultValue={this.state.levelNew}
              />
            </label>
            <br />
            <br />
            <InputSubmit onClick={this.startGame} value="">
              Start
            </InputSubmit>
          </Section>
          <Section show={this.state.tab === 2}>
            <p>Hold your horses. Scoreboards are coming soon.</p>
          </Section>
        </Info>
        <Game gameOver={this.state.gameOver}>
          <Grid gameWon={this.state.gameWon} level={this.state.level}>
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
                      onClick={this.handleTurn}
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
