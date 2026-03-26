const express = require('express');
const app = express();
const port = 3000;

const uploadMiddleware = require('./middlewares/upload.middleware');
const verifyController = require('./controllers/verify.controller');

const v1Routes = require('./routes/v1/verify.route');

app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
  res.send('!Running');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running...`);
});