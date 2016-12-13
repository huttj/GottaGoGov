const levels = {
  error  : 1,
  warning: 2,
  info   : 3,
  debug  : 4
};


const result = module.exports = {};

const level = process.env.LOG_LEVEL || 4;

for (const key in levels) {
  if (levels[key] <= level) {
    result[key] = console.log;
  } else {
    result[key] = noop;
  }
}

function noop() {}
