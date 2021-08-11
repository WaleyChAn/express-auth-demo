const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/express-auth', {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const UserSchama = new mongoose.Schema({
  username: { type: String, unique: true },
  password: {
    type: String,
    set (val) {
      return bcrypt.hashSync(val, 10)
    }
  }
})
const User = mongoose.model('User', UserSchama)

module.exports = { User }
