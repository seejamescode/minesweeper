import React, { Component } from "react";
import "intersection-observer";
import Observer from "react-intersection-observer";
import styled from "styled-components";

const P = styled.p`
  display: ${props => (props.condition ? null : "none")};
`;

const Score = styled.li`
  display: flex;
  justify-content: space-between;

  p {
    display: flex;

    span {
      padding-left: 0.25rem;
    }
  }
`;

const Ol = styled.ol`
  list-style: none;
  margin-bottom: 0;
  padding-left: 0;
`;

const initialState = {
  fetching: true,
  noMorePages: false,
  page: 1,
  scores: []
};

export default class Scores extends Component {
  static defaultProps = {
    level: 10
  };

  state = initialState;

  componentDidMount() {
    this.fetchScores(this.props.level, 1);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.level !== this.props.level) {
      this.fetchScores(this.props.level, 1);
    }
  }

  fetchScores(level, page) {
    fetch(`/scores/${level}/${page}`, {
      credentials: "same-origin"
    })
      .then(response => response.json())
      .then(scores => {
        const newScores = scores.docs.map((score, index) => {
          const observer =
            index === 0 && parseInt(scores.page, 10) < scores.pages ? (
              <Observer triggerOnce={true}>
                {inView => {
                  if (inView) {
                    this.fetchScores(level, this.state.page + 1);
                  }
                  return null;
                }}
              </Observer>
            ) : null;
          return (
            <Score {...score} key={score._id}>
              <p>
                {scores.page * scores.limit + index - scores.limit + 1}.
                <span>
                  <a
                    href={`https://twitter.com/@${score.name}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {score.name}
                  </a>
                  <br />
                  <small>lvl {score.level}</small>
                </span>
              </p>
              <span>
                {score.time}s
                {observer}
              </span>
            </Score>
          );
        });
        this.setState({
          fetching: false,
          page: parseInt(scores.page, 10),
          scores: page === 1 ? newScores : [...this.state.scores, ...newScores]
        });
      })
      .catch(err => {
        console.error("Error ", err);
      });
  }

  render() {
    return (
      <React.Fragment>
        <P condition={!this.state.fetching && this.state.scores.length === 0}>
          No scores submitted for this level or higher yet.
        </P>
        <P condition={this.state.scores.length > 0}>
          Displaying high scores for level {this.props.level} and above:
        </P>
        <Ol>{this.state.scores}</Ol>
        <P condition={this.state.fetching}>Fetching scores.</P>
      </React.Fragment>
    );
  }
}
