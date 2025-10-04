const http = require('http');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
const { json } = require('stream/consumers');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  console.log(request.url);

  const acceptHeader = request.headers.accept || 'application/json';

  switch (request.url) {
    case '/':
      htmlHandler.getIndex(request, response);
      break;
    case '/getStocks':
      jsonHandler.getStocks(request, response);
      break;
    default:
      htmlHandler.getIndex(request, response);
      break;
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
