const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect(
  'mongodb+srv://Amer:S2zFXqUamrqRGVAY@cluster0-8tb8o.mongodb.net/node-prac?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  }
);

app.listen(3000);
