const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor({limit, ...options}) {
    super(options);
    this._limit = limit;
    this._totalSize = 0;
  }

  _transform(chunk, encoding, callback) {
    const chuckSize = Buffer.byteLength(chunk);
    if (this._totalSize + chuckSize > this._limit) {
      callback(new LimitExceededError());
    } else {
      this._totalSize += chuckSize;
      callback(null, chunk);
    }
  }
}

module.exports = LimitSizeStream;
