const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS
app.use(cors());

app.use(bodyParser.json());

// Add a new quote
app.post('/quotes', (req, res) => {
  const { customer, customerId, validity, transitTime, freeTime, incoterms, sailing, commodity, items } = req.body;

  // Validate the request body
  if (!customer || !customerId || !validity || !transitTime || !items || items.length === 0) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  // Calculate totals
  const itemsWithTotal = items.map(item => ({
    ...item,
    total: item.quantity * item.price
  }));
  const subtotal = itemsWithTotal.reduce((sum, item) => sum + item.total, 0);
  const totalInNativeCurrency = subtotal * 0.2;  // Assuming a conversion rate or extra charges
  const total = subtotal + totalInNativeCurrency;

  const newQuote = {
    customer,
    customerId,
    validity,
    transitTime,
    freeTime,
    incoterms,
    sailing,
    commodity,
    items: itemsWithTotal,
    subtotal,
    totalInNativeCurrency,
    total
  };

  db.insert(newQuote, (err, newDoc) => {
    if (err) {
      return res.status(500).send({ error: 'Failed to add quote' });
    }
    res.status(201).send(newDoc);
  });
});

// Get all quotes
app.get('/quotes', (req, res) => {
  db.find({}, (err, docs) => {
    if (err) {
      return res.status(500).send({ error: 'Failed to fetch quotes' });
    }
    res.status(200).send(docs);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
