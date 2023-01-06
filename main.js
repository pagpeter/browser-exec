const express = require('express');
const path = require('node:path');
const crypto = require('node:crypto');

function uuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

class BrowserExec {
  constructor(port, host = '', debug = false) {
    this.host = host;
    this.port = port;
    this.debug = debug;

    this.app = express();
    require('express-ws')(this.app);
    this.ws = null;
    this.connected = false;

    this.results = {};

    this.app.get('/', (req, res, next) => {
      if (this.debug) console.log('GET /');
      res.sendFile(path.join(path.join(__dirname, ''), 'index.html'));
    });

    this.app.ws('/', (ws, req) => {
      if (this.debug) console.log('Connected!');
      this.ws = ws;
      this.connected = true;
      this.onConnect();

      this.ws.on('message', (msg) => {
        const data = JSON.parse(msg);
        if (data.event === 'result') this.results[data.id] = data;
      });
    });
  }

  listen() {
    if (this.debug)
      console.log(
        `[+] listening on ${!!this.host ? 'http://' + this.host + ':' : ''}${
          this.port
        }`
      );
    this.app.listen(this.port);
  }

  onConnect() {}
  exec(code) {
    return new Promise((resolve, reject) => {
      const id = uuid();
      if (this.debug) console.log(`[+] Executing in browser (${id})`);
      this.ws.send(JSON.stringify({ exec: code, id: id }));

      const checkIfDone = () => {
        if (this.results[id]) {
          const res = this.results[id];
          delete this.results[id];
          if (res.result === 'error') reject(res.error);
          resolve(res.result);
        } else {
          setTimeout(checkIfDone, 100);
        }
      };
      checkIfDone();
    });
  }
}

module.exports = BrowserExec;
