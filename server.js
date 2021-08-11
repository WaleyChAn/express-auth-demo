const { User } = require('./models')
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const SECRET = 'dadfasdfasfdadfvcv'

const app = express()

app.use(express.json())
app.use(cors())

app.get('/api/users', async (req, res) => {
  const users = await User.find()
  res.send(users)
})

app.post('/api/register', async (req, res) => {
  const data = { username, password } = req.body
  const user = await User.create(data)
  res.send(user)
})

app.post('/api/login', async (req, res) => {
  const data = { username, password } = req.body
  const user = await User.findOne({ username: data.username })
  if (!user) {
    return res.status(422).send({
      massage: '用户名不存在！'
    })
  }
  const isPasswordValid = bcrypt.compareSync(data.password, user.password)
  if (!isPasswordValid) {
    return res.status(422).send({
      massage: '密码不正确！'
    })
  }

  const token = jwt.sign({
    id: String(user._id)
  }, SECRET)

  res.send({
    user,
    token: token
  })
})

const auth = async (req, res, next) => {
  const token = String(req.headers.authorization).split(' ').pop()
  const id = jwt.verify(token, SECRET).id
  const user = await User.findById(id)
  req.user = user
  next()
}

app.get('/api/profile', auth, async (req, res) => {
  res.send(req.user)
})

app.listen('3000', () => {
  console.log('http://localhost:3000')
})