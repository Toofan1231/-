require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'paint_varnish_shop_secret_key_2024',
  expiresIn: process.env.JWT_EXPIRE || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10
};
