const colorMap = {
  blue: '\x1b[34m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  white: '\x1b[37m',
  green: '\x1b[32m',
};

const cc = (color) => (str) => `${colorMap[color]}${str}\x1b[0m`;

const red = cc('red');
const blue = cc('blue');
const yellow = cc('yellow');
const white = cc('white');
const green = cc('green');

export { blue, red, yellow, white, green };
