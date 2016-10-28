module.exports = function np(fn) {
  return new Promise((resolve, reject) => {
    fn((err, res) => { err ? reject(err) : resolve(res) });
  });
};