function getCell(matrix, y, x) {
  var NO_VALUE = null;
  var value, hasValue;

  try {
    hasValue = matrix[y][x] !== undefined;
    value = hasValue ? matrix[y][x] : NO_VALUE;
  } catch (e) {
    value = NO_VALUE;
  }
  return {
    ...value,
    x,
    y
  };
}

export function isStorageAvailable(type) {
  try {
    var storage = window[type],
      x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.code === 22 ||
        e.code === 1014 ||
        e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      storage.length !== 0
    );
  }
}

export function newGame(level = 10) {
  // Create mines
  const mineCount = Math.ceil(Math.pow(level, 2) / 8);
  let mines = [];
  while (mines.length < mineCount) {
    const position = [
      Math.floor(Math.random() * level),
      Math.floor(Math.random() * level)
    ];

    if (!mines.some(ele => JSON.stringify(ele) === JSON.stringify(position))) {
      mines.push(position);
    }
  }

  // Insert mines in matrix
  let answers = [...Array(level)].map(row => [...Array(level)]);

  for (let i = 0; i < mines.length; i++) {
    answers[mines[i][0]][mines[i][1]] = true;
  }

  // Insert relative numbers in matrix
  for (let row = 0; row < answers.length; row++) {
    let isNotBottom = answers[row - 1] !== undefined;
    let isNotTop = answers[row + 1] !== undefined;

    for (let col = 0; col < answers[row].length; col++) {
      let bottom = isNotBottom && answers[row - 1][col] === true;
      let bottomLeft = isNotBottom && answers[row - 1][col - 1] === true;
      let bottomRight = isNotBottom && answers[row - 1][col + 1] === true;
      let left = answers[row][col - 1] === true;
      let right = answers[row][col + 1] === true;
      let top = isNotTop && answers[row + 1][col] === true;
      let topLeft = isNotTop && answers[row + 1][col - 1] === true;
      let topRight = isNotTop && answers[row + 1][col + 1] === true;
      answers[row][col] =
        answers[row][col] === true
          ? answers[row][col]
          : bottom +
            bottomLeft +
            bottomRight +
            left +
            right +
            top +
            topLeft +
            topRight;
    }
  }

  return answers.map(row =>
    row.map(item => {
      return {
        flagged: false,
        revealed: false,
        value: item
          .toString()
          .replace("0", "")
          .replace("true", "X")
      };
    })
  );
}

export function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function reveal(answers, location) {
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
          newAnswers = reveal(newAnswers, [cell.y, cell.x]);
        }

        newAnswers[cell.y][cell.x] = {
          ...cell,
          flagged: false,
          revealed: true
        };
      }
    });
  }

  return newAnswers;
}

function surroundings(matrix, y, x) {
  return {
    up: getCell(matrix, y - 1, x),
    upRight: getCell(matrix, y - 1, x + 1),
    right: getCell(matrix, y, x + 1),
    downRight: getCell(matrix, y + 1, x + 1),
    down: getCell(matrix, y + 1, x),
    downLeft: getCell(matrix, y + 1, x - 1),
    left: getCell(matrix, y, x - 1),
    upLeft: getCell(matrix, y - 1, x - 1)
  };
}
