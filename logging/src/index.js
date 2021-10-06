// created with lots of love by Jan André Greschner
import express from 'express';
import createError from 'http-errors';
import dotenv from 'dotenv';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import logger from './logger.js';
import { BiRoute, ReceiveRoute } from './routes/index.js';

// read .env file, parse the contents, assign it to process.env
dotenv.config();

// connect to database
db();

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));

// set listening port
const PORT = process.env.PORT || 4000;

// init express
const app = express();

// set body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setup cors
app.use(cors());

// routes
app.use('/log', ReceiveRoute);
app.use('/bi', BiRoute);
app.use('/favicon.ico', express.static('public/favicon.png'));

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

const options = {
  key: fs.readFileSync(`${__dirname}/cert/key.pem`),
  cert: fs.readFileSync(`${__dirname}/cert/cert.pem`),
  passphrase: process.env.PASSPHRASE,
};

https.createServer(options, app).listen(PORT, () => {
  logger.info(`Server is listening on port: ${PORT}`);
});
