const stocks = require('../data/sp500_companies.json');

const watchlists = {};

// GET REQUESTS

// Gets all stocks, filtered by query parameters if provided.
const getStocks = (request, response) => {
  const {
    stocks: stocksParam,
    sector: sectorParam,
    state: stateParam,
    includeMarketcap,
    includeSector,
  } = request.query || {};

  let filteredStocks = stocks;

  // If filter parameters are provided, filter the stocks accordingly.
  if (stocksParam) {
    const requestedSymbols = stocksParam.split(',').map((s) => s.trim().toUpperCase());
    filteredStocks = filteredStocks.filter((stock) => requestedSymbols.includes(stock.Symbol));
  }

  if (sectorParam) {
    filteredStocks = filteredStocks.filter(
      (stock) => stock.Sector && stock.Sector.toLowerCase() === sectorParam.toLowerCase(),
    );
  }

  if (stateParam) {
    filteredStocks = filteredStocks.filter(
      (stock) => stock.State && stock.State.toLowerCase() === stateParam.toLowerCase(),
    );
  }

  if (filteredStocks.length === 0) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({
      message: 'No matching stocks found',
      id: 'notFound',
    }));
    response.end();
    return;
  }

  const data = filteredStocks.map((stock) => {
    const result = {
      name: stock.Longname,
      symbol: stock.Symbol,
    };

    if (includeMarketcap === 'true') {
      result.marketcap = stock.Marketcap;
    }

    if (includeSector === 'true') {
      result.sector = stock.Sector;
    }

    return result;
  });

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(data));
  response.end();
};

// Get all information on a specific stock, identified by its ticker symbol.
const getStock = (request, response) => {
  const { ticker } = request.query || {};

  // If no ticker is provided, return an error.
  if (!ticker) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({
      message: 'Missing required query parameter: ticker',
      id: 'missingParams',
    }));
    response.end();
    return;
  }

  const stockData = stocks.find((stock) => stock.Symbol === ticker.toUpperCase());

  if (!stockData) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({
      message: 'Stock symbol not found',
      id: 'notFound',
      ticker: ticker.toUpperCase(),
    }));
    response.end();
    return;
  }

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(stockData));
  response.end();
};

// Get a watchlist by name, or all watchlists if no name is provided.
const getWatchlist = (request, response) => {
  const { name } = request.query || {};

  // If no name is provided, return all watchlists.
  if (!name) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(watchlists));
    response.end();
    return;
  }

  const watchlist = watchlists[name];

  if (!watchlist) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({
      message: 'Watchlist not found',
      id: 'notFound',
      name,
    }));
    response.end();
    return;
  }

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(watchlist));
  response.end();
};

// get sector information, either for a specific sector or all sectors.
const getSectors = (request, response) => {
  const { sector } = request.query || {};

  const sectorData = {};

  // For each sector, start out all information at 0, add to it as each stock is processed.
  stocks.forEach((stock) => {
    const sectorName = stock.Sector;
    if (!sectorName) return;

    if (!sectorData[sectorName]) {
      sectorData[sectorName] = {
        sector: sectorName,
        count: 0,
        totalMarketcap: 0,
        totalEmployees: 0,
        totalRevenuegrowth: 0,
        averageRevenuegrowth: 0,
        companies: [],
        industries: {},
      };
    }

    sectorData[sectorName].count += 1;
    sectorData[sectorName].totalMarketcap += stock.Marketcap || 0;
    sectorData[sectorName].totalEmployees += stock.Fulltimeemployees || 0;

    if (stock.Revenuegrowth !== undefined && stock.Revenuegrowth !== null) {
      sectorData[sectorName].totalRevenuegrowth += stock.Revenuegrowth;
    }

    // List of companies in the sector.
    sectorData[sectorName].companies.push({
      symbol: stock.Symbol,
      name: stock.Longname,
    });

    const industry = stock.Industry;
    if (industry) {
      if (!sectorData[sectorName].industries[industry]) {
        sectorData[sectorName].industries[industry] = 0;
      }
      sectorData[sectorName].industries[industry] += 1;
    }
  });

  Object.keys(sectorData).forEach((sectorName) => {
    const data = sectorData[sectorName];
    data.averageMarketcap = data.count > 0 ? data.totalMarketcap / data.count : 0;
    data.averageEmployees = data.count > 0 ? data.totalEmployees / data.count : 0;
    data.averageRevenuegrowth = data.count > 0 ? data.totalRevenuegrowth / data.count : 0;
  });

  // If a specific sector is requested, return only that sector's data, else return all sectors.
  if (sector) {
    const requestedSector = Object.keys(sectorData).find(
      (key) => key.toLowerCase() === sector.toLowerCase(),
    );

    if (!requestedSector) {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify({
        message: 'Sector not found',
        id: 'notFound',
        sector,
      }));
      response.end();
      return;
    }

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(sectorData[requestedSector]));
    response.end();
    return;
  }

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(Object.values(sectorData)));
  response.end();
};

// POST REQUESTS
// Create a new watchlist with a given name and optional list of stock tickers.
const makeWatchlist = (request, response, body) => {
  const { name, tickers } = body;

  if (!name) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({
      message: 'Missing required field: name',
      id: 'missingParams',
    }));
    response.end();
    return;
  }

  if (watchlists[name]) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({
      message: 'Watchlist with this name already exists',
      id: 'duplicateName',
    }));
    response.end();
    return;
  }

  const stocksData = [];
  const invalidTickers = [];

  // Push specific stocks data to the watchlist, if provided.
  if (tickers) {
    const tickerArray = Array.isArray(tickers) ? tickers : tickers.split(',').map((t) => t.trim());

    tickerArray.forEach((ticker) => {
      const stockData = stocks.find((stock) => stock.Symbol === ticker.toUpperCase());
      if (stockData) {
        stocksData.push(stockData);
      } else {
        invalidTickers.push(ticker.toUpperCase());
      }
    });
  }

  watchlists[name] = {
    name,
    stocks: stocksData,
    createdAt: new Date().toISOString(),
  };

  const responseData = {
    message: 'Watchlist created successfully',
    watchlist: {
      name,
      stockCount: stocksData.length,
      stocks: stocksData.map((stock) => ({
        symbol: stock.Symbol,
        name: stock.Longname,
      })),
    },
  };

  if (invalidTickers.length > 0) {
    responseData.warning = `Some tickers were not found: ${invalidTickers.join(', ')}`;
  }

  response.writeHead(201, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(responseData));
  response.end();
};

// Add stocks to an existing watchlist by name, using a list of tickers.
const addToWatchlist = (request, response, body) => {
  const { name, tickers } = body;

  if (!name || !tickers) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({
      message: 'Missing required fields: name and tickers',
      id: 'missingParams',
    }));
    response.end();
    return;
  }

  if (!watchlists[name]) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({
      message: 'Watchlist not found',
      id: 'notFound',
      name,
    }));
    response.end();
    return;
  }

  const tickerArray = Array.isArray(tickers) ? tickers : tickers.split(',').map((t) => t.trim());
  const existingSymbols = watchlists[name].stocks.map((stock) => stock.Symbol);
  const addedStocks = [];
  const duplicates = [];
  const invalidTickers = [];

  tickerArray.forEach((ticker) => {
    const upperTicker = ticker.toUpperCase();

    if (existingSymbols.includes(upperTicker)) {
      duplicates.push(upperTicker);
      return;
    }

    const stockData = stocks.find((stock) => stock.Symbol === upperTicker);
    if (stockData) {
      watchlists[name].stocks.push(stockData);
      addedStocks.push(stockData);
    } else {
      invalidTickers.push(upperTicker);
    }
  });

  const responseData = {
    message: 'Stocks processed',
    watchlist: {
      name,
      stockCount: watchlists[name].stocks.length,
      addedCount: addedStocks.length,
      addedStocks: addedStocks.map((stock) => ({
        symbol: stock.Symbol,
        name: stock.Longname,
      })),
    },
  };

  if (duplicates.length > 0) {
    responseData.duplicates = duplicates;
  }

  if (invalidTickers.length > 0) {
    responseData.invalidTickers = invalidTickers;
  }

  response.writeHead(201, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(responseData));
  response.end();
};

module.exports.getStocks = getStocks;
module.exports.getStock = getStock;
module.exports.getWatchlist = getWatchlist;
module.exports.getSectors = getSectors;
module.exports.makeWatchlist = makeWatchlist;
module.exports.addToWatchlist = addToWatchlist;
