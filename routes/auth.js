const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')

//REGISTER
router.post('/register', async (req, res) => {
  try {
    //generar nueva contraseña
    const salt = await bcrypt.genSalt(10)
    const hashePassword = await bcrypt.hash(req.body.password, salt)

    //Crear nuevo usuario
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashePassword
    })
    //guardar usuario y responder
    const user = await newUser.save()
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json(error)
  }
})

//LOGIN
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    !user && res.status(404).json('usuario no encontrado')

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    !validPassword && res.status(400).json('contraseña incorrecta')

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json(error)
  }
})

module.exports = router
