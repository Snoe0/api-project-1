const stocks = require('../data/sp500_companies.json');

const getStocks = (request, response) => {
  const { stocks: stocksParam } = request.query;

  if (stocksParam && stocksParam.toLowerCase() === 'all') {
    const allData = stocks.map((stock) => ({
      name: stock.Longname,
      symbol: stock.Symbol,
      sector: stock.Sector,
      industry: stock.Industry,
      marketcap: stock.Marketcap,
    }));
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(allData));
    response.end();
    return;
  }

  if (stocksParam) {
    const requestedSymbols = stocksParam.split(',').map((s) => s.trim().toUpperCase());
    const filteredStocks = stocks.filter((stock) => requestedSymbols.includes(stock.Symbol));

    if (filteredStocks.length === 0) {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify({
        message: 'No matching stock symbols found',
        id: 'notFound',
      }));
      response.end();
      return;
    }

    const data = filteredStocks.map((stock) => ({
      name: stock.Longname,
      symbol: stock.Symbol,
      sector: stock.Sector,
      industry: stock.Industry,
      marketcap: stock.Marketcap,
    }));
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(data));
    response.end();
  }
};

const getStock = (request, response) => {
  const { ticker } = request.query;

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

const compareStocks = (request, response) => {
  const { stocks: stocksParam, properties: propertiesParam } = request.query;

  if (!stocksParam) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({
      message: 'Missing required query parameter: stocks',
      id: 'missingParams',
    }));
    response.end();
    return;
  }

  const stockSymbols = stocksParam.split(',').map((s) => s.trim().toUpperCase());

  if (stockSymbols.length < 2) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({
      message: 'At least 2 stock symbols are required for comparison',
      id: 'insufficientStocks',
    }));
    response.end();
    return;
  }

  const defaultProperties = ['Longname', 'Symbol', 'Sector', 'Industry', 'Marketcap'];
  const properties = propertiesParam
    ? propertiesParam.split(',').map((p) => p.trim())
    : defaultProperties;

  const stockDataArray = stockSymbols.map((symbol) => ({
    symbol,
    data: stocks.find((stock) => stock.Symbol === symbol),
  }));

  const notFound = stockDataArray.filter((item) => !item.data);
  if (notFound.length > 0) {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({
      message: 'One or more stock symbols not found',
      id: 'notFound',
      notFoundSymbols: notFound.map((item) => item.symbol),
    }));
    response.end();
    return;
  }

  const comparisonData = {};
  stockDataArray.forEach((item, index) => {
    const stockKey = `stock${index + 1}`;
    comparisonData[stockKey] = {};

    properties.forEach((prop) => {
      if (item.data[prop] !== undefined) {
        comparisonData[stockKey][prop] = item.data[prop];
      }
    });
  });

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(comparisonData));
  response.end();
};

const getSectors = (request, response) => {
  const { sector } = request.query;

  const sectorData = {};

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

    sectorData[sectorName].companies.push({
      symbol: stock.Symbol,
      name: stock.Longname,
      marketcap: stock.Marketcap,
      industry: stock.Industry,
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

module.exports.getStocks = getStocks;
module.exports.getStock = getStock;
module.exports.getCompare = compareStocks;
module.exports.getSectors = getSectors;
