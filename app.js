const express = require('express');
const ErrorHandler = require('./utilities/errorHandler');
const usersRoute = require('./routes/usersRoute');
const toursRoute = require('./routes/toursRoute');
const errorController = require('./controllers/error');
const app = express();

app.use(express.json());

app.use('/tours', toursRoute);

app.use('/users', usersRoute);

app.all('*', (req, res, next) => {
  next(
    new ErrorHandler('This route ' + req.originalUrl + ' is not found!', 404)
  );
});

app.use(errorController);

module.exports = app;

//database = mongodb+srv://Amer:S2zFXqUamrqRGVAY@cluster0-8tb8o.mongodb.net/node-prac?retryWrites=true&w=majority
//database password: S2zFXqUamrqRGVAY
