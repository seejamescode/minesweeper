export default function(level = 10) {
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
