const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const DESKTOP = 'C:\\Users\\Prajwal\\Desktop';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/logs/:name', (req, res) => {
  const allowed = ['backend.log', 'frontend.log'];
  if (!allowed.includes(req.params.name)) return res.status(403).send('Forbidden');
  const filePath = path.join(DESKTOP, req.params.name);
  if (!fs.existsSync(filePath)) return res.status(404).send('Log not found yet');
  res.setHeader('Content-Type', 'text/plain');
  res.send(fs.readFileSync(filePath, 'utf8'));
});

app.listen(5002, () => console.log('Log server on http://localhost:5002'));