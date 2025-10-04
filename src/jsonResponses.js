const stocks = require('../data/sp500_companies.json');

const getSuccess = (request, response) => {
  const responseJSON = {
    message: 'This is a successful response',
  };
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(responseJSON));
  response.end();
};

const getBadRequest = (request, response) => {
  const responseJSON = {
    message: 'This request has the required parameters',
  };

  if (!request.url.includes('valid=true')) {
    responseJSON.id = 'badRequest';
    responseJSON.message = 'Missing valid query parameter set to true';
    response.writeHead(400, { 'Content-Type': 'application/json' });
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' });
  }

  response.write(JSON.stringify(responseJSON));
  response.end();
};


const getNotFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  response.writeHead(404, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(responseJSON));
  response.end();
};


const getStocks = (request, response) => {
  data = stocks.map(stock => ({
    name: stock.Longname,
    symbol: stock.Symbol}));
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(data));
  response.end();
};

const getCompanies = (request, response) => {
  


module.exports.getSuccess = getSuccess;
module.exports.getBadRequest = getBadRequest;
module.exports.getNotFound = getNotFound;
module.exports.getStocks = getStocks;