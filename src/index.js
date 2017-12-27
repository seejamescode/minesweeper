import React from "react";
import ReactDOM from "react-dom";
import Minesweeper from "./Minesweeper";
import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(<Minesweeper />, document.getElementById("root"));
registerServiceWorker();
