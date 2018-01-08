import styled from "styled-components";

export const InputButton = styled.button`
  background: none;
  color: inherit;
  border: 2px solid #fff;
  padding: 0.5rem 1rem;
`;

export const InputButtonInline = styled.button`
  background: inherit;
  border: none;
  color: inherit;
  display: ${props => (props.shouldNotDisplay ? "none" : null)};
  font: inherit;
  padding: 0;
  text-decoration: underline;
`;

export const InputCheckbox = styled.label`
  display: block;
  position: relative;
  padding-left: 30px;
  margin-bottom: 5px;
  padding-top: 3px;
  cursor: pointer;

  input {
    position: absolute;
    z-index: -1;
    opacity: 0;
  }

  div {
    position: absolute;
    top: 2px;
    left: 0;
    height: 0.85rem;
    width: 0.85rem;
    background: none;
    border: 2px solid #fff;
    text-align: center;
    color: #000;
  }

  input:checked ~ div {
    background: #fff;
  }
  div:after {
    box-sizing: unset;
    content: "";
    position: absolute;
    display: none;
  }
  input:checked ~ div:after {
    display: block;
  }
  -checkbox div:after {
    left: 5px;
    top: 1px;
    width: 3px;
    height: 8px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

export const InputRange = styled.input`
  appearance: none;
  width: 100%;
  margin: 6.5px 0;
  ::-webkit-slider-runnable-track {
    width: 100%;
    height: 2px;
    cursor: pointer;
    box-shadow: 0px 0px 0px #002200, 0px 0px 0px #003c00;
    background: #ffffff;
    border-radius: 25px;
    border: 0px solid #18d501;
  }
  ::-webkit-slider-thumb {
    box-shadow: 0px 0px 0px #00aa00, 0px 0px 0px #00c300;
    border: 2.3px solid #ffffff;
    height: 15px;
    width: 16px;
    border-radius: 12px;
    background: #000000;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -6.5px;
  }
  ::-moz-range-track {
    width: 100%;
    height: 2px;
    cursor: pointer;
    box-shadow: 0px 0px 0px #002200, 0px 0px 0px #003c00;
    background: #ffffff;
    border-radius: 25px;
    border: 0px solid #18d501;
  }
  ::-moz-range-thumb {
    box-shadow: 0px 0px 0px #00aa00, 0px 0px 0px #00c300;
    border: 2.3px solid #ffffff;
    height: 15px;
    width: 16px;
    border-radius: 12px;
    background: #000000;
    cursor: pointer;
  }
  ::-ms-track {
    width: 100%;
    height: 2px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
  ::-ms-fill-lower {
    background: #e6e6e6;
    border: 0px solid #18d501;
    border-radius: 50px;
    box-shadow: 0px 0px 0px #002200, 0px 0px 0px #003c00;
  }
  ::-ms-fill-upper {
    background: #ffffff;
    border: 0px solid #18d501;
    border-radius: 50px;
    box-shadow: 0px 0px 0px #002200, 0px 0px 0px #003c00;
  }
  ::-ms-thumb {
    box-shadow: 0px 0px 0px #00aa00, 0px 0px 0px #00c300;
    border: 2.3px solid #ffffff;
    height: 15px;
    width: 16px;
    border-radius: 12px;
    background: #000000;
    cursor: pointer;
    height: 2px;
  }
`;

export const InputTab = styled.label`
  box-sizing: border-box;
  background: ${props => (props.checked ? "#fff" : null)};
  color: ${props => (props.checked ? "#000" : null)};
  display: ${props => (props.doNotDisplay ? "none" : "flex")};
  padding: 0.5rem 1rem;
  text-align: center;

  input {
    margin: 0;
    visibility: hidden;
    width: 0;
  }
`;

export const InputTabs = styled.form`
  border-bottom: 2px solid #fff;
  display: flex;
`;
