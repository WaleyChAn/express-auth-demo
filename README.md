## 概述

使用 express 搭建简单的服务端实现用户注册登录功能，使用 mongodb 进行数据存储。

## 准备

- express 和 mongodb 的基本使用 [在这 →](https://github.com/WaleyChAn/express-mongodb-demo)
- 安装并配置 [nodejs](https://nodejs.org/zh-cn/)
- 安装并配置 [mongodb](https://www.mongodb.org)

## 初始化 express

```bash
npm install express --save
```

```bash
const express = require('express')
const app = express()

app.listen(3000, () => {
  console.log('listen ok')
})
```

## 初始化 mongoose

```bash
npm install mongoose --save
```

```bash
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/express', {
  useUnifiedTopology: true,
  useNewUrlParser: true
})
```

## 创建模型

由于这次的模型是用户账号信息，有密码字段，所以使用 bcrypt 来对密码进行加密存储

```bash
npm install bcrypt --save
```

```bash
const bcrypt = require('bcrypt')

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
```

## 创建接口

#### 注册

```bash
app.post('/api/register', async (req, res) => {
  const data = { username, password } = req.body
  const user = await User.create(data)
  res.send(user)
})
```

#### 登录

登录的逻辑总共分 3 步：

- 通过传入的 username 查找数据库中是否有对应用户记录
- 通过传入 password 校验比对上一步中查找出来的用户记录的对应字段，这里要用到上面提到的 bcrypt
- 生成 token 传回客户端，用户后续接口校验使用，这里需要用到 jsonwebtoken 的包

每个步骤出现了错误都需要抛出

```bash
npm install jsonwebtoken --save
```

```bash
const jwt = require('jsonwebtoken')
// jsonwebtoken 加密时使用的密钥
const SECRET = 'dadfasdfasfdadfvcv'

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
```

#### 业务接口访问

这里的业务接口指代的是需要校验用户，需要登录才能进行操作的接口，由于这些接口可能会有很多个，所以一般都是使用一个中间件来处理用户 token 的校验

这里我们创建一个中间件的方法

```bash
const auth = async (req, res, next) => {
  const token = String(req.headers.authorization).split(' ').pop()
  const id = jwt.verify(token, SECRET).id
  const user = await User.findById(id)
  req.user = user
  next()
}
```

前端请求中需要将 token 放在请求头中一并提交过来，一般行业储存规则为 Bearer + 空格 + token，与前端协商好格式防止 token 解析出错。

校验通过后就可以进行业务请求了

```bash
app.get('/api/profile', auth, async (req, res) => {
  res.send(req.user)
})
```
