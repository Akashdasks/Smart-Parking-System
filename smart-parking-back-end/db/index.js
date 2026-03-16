const mongoose = require('mongoose');
require('dotenv').config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Db is Connected'))
  .catch(e => console.log(e));

module.exports = mongoose;
