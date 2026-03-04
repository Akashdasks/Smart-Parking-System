const mongoose = require('mongoose');

mongoose
  .connect('mongodb://localhost:27017/smart-parking')
  .then(() => {
    console.log('Db is Connected');
  })
  .catch(e => {
    console.log(e);
  });

module.exports = mongoose;
