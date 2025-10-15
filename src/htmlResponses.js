const fs = require('fs');

const indexTemplate = fs.readFileSync(`${__dirname}/../client/client.html`);
const docsTemplate = fs.readFileSync(`${__dirname}/../client/docs.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);
const clientJS = fs.readFileSync(`${__dirname}/../client/client.js`);
const docsJS = fs.readFileSync(`${__dirname}/../client/docs.js`);

// Loads the client.html file and style sheet, displaying it with the server.
const getIndex = (request, response) => {
  let indexStr = indexTemplate.toString();
  indexStr = indexStr.replace('<link rel="stylesheet" type="text/css" href="/style.css">', `<style>${css}</style>`);

  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(indexStr);
  response.end();
};

// Loads the docs.html file and style sheet, displaying it with the server.
const getDocs = (request, response) => {
  let docsStr = docsTemplate.toString();
  docsStr = docsStr.replace('<link rel="stylesheet" type="text/css" href="/style.css">', `<style>${css}</style>`);

  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(docsStr);
  response.end();
};

// Manages the JS files for the client and docs pages.
const getClientJS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(clientJS);
  response.end();
};

const getDocsJS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/javascript' });
  response.write(docsJS);
  response.end();
};

module.exports.getIndex = getIndex;
module.exports.getDocs = getDocs;
module.exports.getClientJS = getClientJS;
module.exports.getDocsJS = getDocsJS;
