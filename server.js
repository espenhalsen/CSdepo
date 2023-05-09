const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const localStorage = {};

app.get('/', (req, res) => {
  res.render('home', { createTradeUrl: '/create-trade' });
});

app.get('/create-trade', (req, res) => {
  res.render('create-trade');
});

app.post('/create-trade', (req, res) => {
  const itemName = req.body.itemName;
  const price = req.body.price;
  const tradeId = uuidv4();
  const tradeInfo = {
    itemName: itemName,
    price: price,
    initiator: true,
    ready: false,
  };
  localStorage[tradeId] = tradeInfo;
  res.render('trade-created', { tradeUrl: `http://localhost:3000/trade/${tradeId}` });
});

app.get('/trade/:tradeId', (req, res) => {
  const tradeId = req.params.tradeId;
  const tradeInfo = localStorage[tradeId];
  if (tradeInfo) {
    if (tradeInfo.initiator) {
      res.render('trade-status-initiator', { uuid: tradeId });
    } else {
      res.render('trade-status-receiver', { uuid: tradeId });
    }
  } else {
    res.status(404).send('Handelen ble ikke funnet.');
  }
});

app.post('/trade/:tradeId', (req, res) => {
  const tradeId = req.params.tradeId;
  const tradeInfo = localStorage[tradeId];
  if (tradeInfo) {
    tradeInfo.ready = true;
    localStorage[tradeId] = tradeInfo;
    res.render('trade-ready');
  } else {
    res.status(404).send('Handelen ble ikke funnet.');
  }
});

app.post('/trade/:tradeId/cancel', (req, res) => {
  const tradeId = req.body.tradeId;
  delete localStorage[tradeId];
  res.render('trade-cancelled');
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
