// created with lots of love by Jan André Greschner
import express from 'express';
import createError from 'http-errors';
import dotenv from 'dotenv';
import cors from 'cors';
import logger from './logger.js';
import receiveRoute from './routes/receive.js';

// read .env file, parse the contents, assign it to process.env
dotenv.config();

// set listening port
const PORT = process.env.PORT || 4000;

const app = express();

// set body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setup cors
app.use(cors());

// routes
app.use('/', receiveRoute);

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(PORT, () => {
  logger.info(`Server is listening on port: ${PORT}`);
});