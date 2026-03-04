const jwt = require('jsonwebtoken');
require('dotenv').config();

const checkToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(403)
        .json({ message: 'No token provided or invalid format' });
    }

    const token = authHeader.split(' ')[1];
    // console.log(token);
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = checkToken;
