const User = require('../models/User')
const router = require('express').Router()
const bcrypt = require('bcrypt')

//Actualizar usuario
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
      } catch (err) {
        return res.status(500).json(err)
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body
      })
      res.status(200).json('Se actualizó la cuenta')
    } catch (err) {
      return res.status(500).json(err)
    }
  } else {
    return res.status(403).json('¡Solo puede actualizar su cuenta!')
  }
})

//Borrar usuario
router.delete('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id)
      res.status(200).json('La cuenta ha sido eliminada')
    } catch (err) {
      return res.status(500).json(err)
    }
  } else {
    return res.status(403).json('¡Solo puede eliminar su cuenta!')
  }
})

//Conseguir un usuario
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    const { password, updatedAt, ...other } = user._doc
    res.status(200).json(other)
  } catch (err) {
    res.status(500).json(err)
  }
})

//Seguir a un usuario
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.body.userId)
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } })
        await currentUser.updateOne({ $push: { followings: req.params.id } })
        res.status(200).json('El usuario ha sido seguido')
      } else {
        res.status(403).json('Ya sigues a este usuario')
      }
    } catch (err) {
      res.status(500).json(err)
    }
  } else {
    res.status(403).json('no puedes seguirte a ti mismo')
  }
})

//Dejar de seguir a un usuario

router.put('/:id/unfollow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.body.userId)
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } })
        await currentUser.updateOne({ $pull: { followings: req.params.id } })
        res.status(200).json('user has been unfollowed')
      } else {
        res.status(403).json('you dont follow this user')
      }
    } catch (err) {
      res.status(500).json(err)
    }
  } else {
    res.status(403).json('you cant unfollow yourself')
  }
})

module.exports = router
