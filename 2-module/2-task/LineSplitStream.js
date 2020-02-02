const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this._totalChunk = '';
  }

  _transform(chunk, encoding, callback) {
    this._totalChunk += chunk.toString();
    callback();
  }

  _flush(callback) {
    const lines = this._totalChunk.split(os.EOL);
    lines.forEach((line) => {
      this.push(line);
    });
    callback();
  }
}

module.exports = LineSplitStream;
