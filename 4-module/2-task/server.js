const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  if (pathname.includes('/')) {
    res.statusCode = 400;
    res.end('Subdirectories are not supported');
    return;
  }

  switch (req.method) {
    case 'POST':
      fs.access(filepath, fs.constants.F_OK, (err) => {
        if (!err) {
          res.statusCode = 409;
          res.end('Already exists');
        } else {
          const writeFile = fs.createWriteStream(filepath);
          const limitedStream = new LimitSizeStream({limit: 1000000});

          req
              .on('aborted', () => {
                fs.unlink(filepath, (err) => {
                  if (err) console.error('unlink error: ', err);
                });
              })
              .pipe(limitedStream)
              .on('error', (err) => {
                if (err.code === 'LIMIT_EXCEEDED') {
                  writeFile.destroy();
                  fs.unlink(filepath, (err) => {
                    if (err) console.error('unlink error: ', err);
                  });
                  res.statusCode = 413;
                  res.end('File limit exceeded');
                }
              })
              .pipe(writeFile)
              .on('error', (err) => {
                console.error('writing error: ', err);
                res.statusCode = 500;
                res.end('Internal server error');
              })
              .on('finish', () => {
                res.statusCode = 201;
                res.end('Successfully created');
              });
        }
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
