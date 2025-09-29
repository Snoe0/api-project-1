const fs = require('fs');

const indexTemplate = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

const getIndex = (request, response) => {
  let indexStr = indexTemplate.toString();
  indexStr = indexStr.replace('<link rel="stylesheet" type="text/css" href="/style.css">', `<style>${css}</style>`);

  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(indexStr);
  response.end();
};

const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

module.exports.getIndex = getIndex;
module.exports.getCSS = getCSS;
