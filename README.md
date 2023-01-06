# BrowserExec

⚠️ This project is in a very early stage and should not be used in production

## What

This is a small library I hacked together. It aims to make it very easy to "connect" a browser like chrome to your Node.js project, and allows you to execute JavaScript in the browser context, without using libraries like puppeteer or selenium. These libraries can easily be detected by anti-bot solutions, a normal chrome browser not.

## Why

This makes this library perfect for writing half-assed bypasses to anti-bot solutions like cloudflare, without solving all of the challenges entirely.
This is especially useful for stuff like canvas fingerprinting, which cannot easily be "faked" or solved in Node.js

## How

The Node.js context communicates with the browser using websockets. This means one browser instance can be used for a lot of concurrent tasks, making it relatively performant.

You can either manually open the browser, or open it using command line arguments

```js
const BrowserExec = require('browser-exec');
const { exec } = require('child_process');

// config
const binaryPath =
  '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome'; // different on windows or linux
const host = 'localhost';
const port = '9090';
const debug = true;

const executor = new BrowserExec(port, host, debug); // host and debug are optional. Default: localhost, false

executor.listen();
executor.onConnect = async () => {
  const res = await executor.exec('window.location.href');
  console.log('Result:', res);
};
exec(`${binaryPath} --homepage http://${host}:${port}`);
```
