import React, { Component } from "react";
import styled, { injectGlobal } from "styled-components";
import { getParameterByName, newGame, reveal } from "./functions";
import {
  InputButton,
  InputButtonInline,
  InputRange,
  InputTab,
  InputTabs
} from "./Inputs";
import { celebration, shake } from "./keyframes";
import Scores from "./Scores";

injectGlobal`
  body {
    background: black;
    color: white;
    font-family: monospace;
    margin: 0;
    padding: 0;
  }

  a {
    color: inherit;
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
    / minmax(auto, 100vh) minmax(14.5rem, auto);
  max-height: 100vh;

  > * {
    max-height: 100vh;
  }

  @media (orientation: portrait) {
    align-content: space-between;
    grid-template:
      "info" 50vh
      "game" 50vh;
    height: 100vh;
    overflow: hidden;

    > * {
      max-height: initial;
    }
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
  display: flex;
  grid-area: game;
  justify-content: center;
  position: relative;
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
  max-width: 100vh;
  position: absolute;
  width: 100%;

  @media (orientation: portrait) {
    font-size: ${props => 100 / props.level / 2}vw;
    max-width: 100%;
    width: 50vh;
  }
`;

const Info = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  grid-area: info;

  * {
    margin-top: 0;
  }
`;

const InfoHeader = styled.header`
  padding: 1rem;

  > p {
    margin-bottom: 0;
  }
`;

const InfoSection = styled.section`
  display: ${props => (!props.show ? "none" : null)};
  grid-area: info-section;
  overflow-y: auto;
  padding: 1rem;

  input,
  li,
  p {
    max-width: 25rem;
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

export default class Minesweeper extends Component {
  static defaultProps = {
    flagMode: false,
    gameOver: false,
    gameWon: false,
    level: 10,
    minesFlagged: 0,
    tab: 0,
    turn: 0,
    status: "So far, so good.",
    time: 0,
    timeFinal: 0
  };

  state = {
    ...this.props,
    answers: newGame(this.props.level),
    levelNew: this.props.level,
    totalMines: Math.ceil(Math.pow(this.props.level, 2) / 8)
  };

  componentDidMount() {
    this.timer = setInterval(this.tick, 1000);
    let submittedFor = getParameterByName("submittedFor");
    if (submittedFor !== null) {
      submittedFor = parseInt(submittedFor, 10);
      this.setState({
        answers: newGame(submittedFor),
        level: submittedFor,
        levelNew: submittedFor,
        status: "Your score was added to the scoreboard.",
        tab: 2,
        totalMines: Math.ceil(Math.pow(submittedFor, 2) / 8)
      });
    }
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
    e.preventDefault();
    const location = e.target
      .getAttribute("value")
      .split(",")
      .map(num => parseInt(num, 10));

    if (this.state.flagMode || e.type === "contextmenu") {
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
                  Game over.{" "}
                  <InputButtonInline onClick={this.startGame}>
                    Try again?
                  </InputButtonInline>
                </React.Fragment>
              )
            };
          }
        }
      }

      if (count === 0 && gameOver.gameOver === undefined) {
        clearInterval(this.timer);
        gameWon = {
          gameWon: true,
          tab: 3,
          status: "You won this one!",
          timeFinal: this.state.time
        };
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
      tab: this.state.tab === 3 ? 0 : this.state.tab,
      totalMines: Math.ceil(Math.pow(this.state.levelNew, 2) / 8)
    });
    this.timer = setInterval(this.tick, 1000);
  };

  tick = () => {
    this.setState({ time: this.state.time + 1 });
  };

  render() {
    return (
      <Container>
        <Info>
          <div>
            <InfoHeader>
              <h1>Minesweeper</h1>
              <p>
                Level: {this.state.level} / Flags Left:{" "}
                {this.state.totalMines - this.state.minesFlagged} / Score:{" "}
                {this.state.timeFinal > 0
                  ? this.state.timeFinal
                  : this.state.time}s
                <br />
                <br />
                {this.state.status}
              </p>
            </InfoHeader>
            <InputTabs>
              <InputTab checked={this.state.tab === 0}>
                <input
                  checked={this.state.tab === 0}
                  name="tab"
                  onChange={this.changeTab}
                  tab={this.state.tab}
                  type="radio"
                  value={0}
                />About
              </InputTab>
              <InputTab checked={this.state.tab === 1}>
                <input
                  checked={this.state.tab === 1}
                  name="tab"
                  onChange={this.changeTab}
                  tab={this.state.tab}
                  type="radio"
                  value={1}
                />Difficulty
              </InputTab>
              <InputTab checked={this.state.tab === 2}>
                <input
                  checked={this.state.tab === 2}
                  name="tab"
                  onChange={this.changeTab}
                  tab={this.state.tab}
                  type="radio"
                  value={2}
                />Scoreboard
              </InputTab>
              <InputTab
                checked={this.state.tab === 3}
                doNotDisplay={!this.state.gameWon}
              >
                <input
                  checked={this.state.tab === 3}
                  name="tab"
                  onChange={this.changeTab}
                  tab={this.state.tab}
                  type="radio"
                  value={3}
                />Submit
              </InputTab>
            </InputTabs>
          </div>
          <InfoSection show={this.state.tab === 0}>
            <p>
              Instructions: Select all squares that do not contain a mine (X). A
              safe square tells you how many mines neighbor itself. Optionally
              right-click a mine to safely flag it.
            </p>
            <p>
              Created by{" "}
              <a href="https://twitter.com/seejamescode">James Y Rauhut.</a>
            </p>
          </InfoSection>
          <InfoSection show={this.state.tab === 1}>
            <label>
              <p>New Level: {this.state.levelNew}</p>
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
            <InputButton onClick={this.startGame} value="">
              New game
            </InputButton>
          </InfoSection>
          <InfoSection show={this.state.tab === 2}>
            <Scores level={this.state.level} />
          </InfoSection>
          <InfoSection show={this.state.tab === 3}>
            <p>
              Congrats. Would you like to submit your score using your Twitter
              handle?
              <br />
              <br />
              <a href={`/login/${this.state.level}/${this.state.timeFinal}`}>
                Submit score
              </a>
            </p>
          </InfoSection>
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
                      onContextMenu={this.handleTurn}
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
