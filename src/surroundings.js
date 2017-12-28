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

export default function surroundings(matrix, y, x) {
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
