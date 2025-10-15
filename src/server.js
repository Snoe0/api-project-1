const http = require('http');
const url = require('url');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  console.log(request.url);

  // Parses the URL for the switch statement for proper request handling.
  const parsedUrl = url.parse(request.url, true);
  request.query = parsedUrl.query;

  // If the request method is POST, parse the request body.
  if (request.method === 'POST') {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk.toString();
    });
    request.on('end', () => {
      try {
        const bodyParams = JSON.parse(body);
        switch (parsedUrl.pathname) {
          case '/makeWatchlist':
            jsonHandler.makeWatchlist(request, response, bodyParams);
            break;
          case '/addToWatchlist':
            jsonHandler.addToWatchlist(request, response, bodyParams);
            break;
          default:
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify({ message: 'Not found', id: 'notFound' }));
            response.end();
            break;
        }
      } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.write(JSON.stringify({ message: 'Invalid JSON', id: 'badRequest' }));
        response.end();
      }
    });
    return;
  }

  // Handles GET requests.
  switch (parsedUrl.pathname) {
    case '/':
      htmlHandler.getIndex(request, response);
      break;
    case '/client.js':
      htmlHandler.getClientJS(request, response);
      break;
    case '/docs.js':
      htmlHandler.getDocsJS(request, response);
      break;
    case '/getStocks':
      jsonHandler.getStocks(request, response);
      break;
    case '/getSectors':
      jsonHandler.getSectors(request, response);
      break;
    case '/getStock':
      jsonHandler.getStock(request, response);
      break;
    case '/getWatchlist':
      jsonHandler.getWatchlist(request, response);
      break;
    case '/docs':
      htmlHandler.getDocs(request, response);
      break;
    default:
      htmlHandler.getIndex(request, response);
      break;
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
