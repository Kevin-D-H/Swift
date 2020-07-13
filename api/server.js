const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

const app = express();
const SERVER_PORT = process.env.PORT || 3264;

// Parse JSON bodies
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Set Lumiqon server header
app.use((req, res, next) => {
  // res.setHeader('Server', 'Lumiqon');
  res.setHeader('X-Powered-By', 'Lumiqon');
  next();
});

// Handle malformed JSON requests
app.use((err, req, res, next) => {
  // check if this is a JSON parsing issue
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error(err);
    return res.status(400).send({ status: 400, reason: 'Bad Request' });
  }
  return next();
});

// API handle requests
app.delete('/', require('./api/api'));
app.get('/', require('./api/api'));
app.post('/', require('./api/api'));
app.put('/', require('./api/api'));

// Handle favicon requests
app.get('/favicon.ico', (req, res) => { res.status(204).end(); });

// Start server
const server = app.listen(SERVER_PORT, () => {
  if (!process.env.PORT) {
    console.log(`Server listening on port: ${server.address().port}`);
  }
});

// return object for unit testing
module.exports = server;
