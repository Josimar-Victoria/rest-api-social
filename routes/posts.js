const router = require('express').Router()
const Post = require('../models/Post')

// crea una publicación
router.post('/', async (req, res) => {
  const newPost = new Post(req.body)
  try {
    const savedPost = await newPost.save()
    res.status(200).json(savedPost)
  } catch (error) {
    res.status(500).json(error)
  }
})

// actualizar una publicación
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body })
      res.status(200).json('La publicación ha sido actualizada')
    } else {
      res.status(403).json('Puedes actualizar solo tu publicación')
    }
  } catch (err) {
    res.status(500).json(err)
  }
})

// eliminar una publicación
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (post.userId === req.body.userId) {
      await post.deleteOne()
      res.status(200).json('La publicación ha sido eliminada')
    } else {
      res.status(403).json('Puedes borrar solo tu publicación')
    }
  } catch (err) {
    res.status(500).json(err)
  }
})

// me gusta / no me gusta una publicación
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } })
      res.status(200).json('La publicación le ha gustado')
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } })
      res.status(200).json('No se ha dado me gusta a la publicación')
    }
  } catch (err) {
    res.status(500).json(err)
  }
})

// obtener una publicación
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    res.status(200).json(post)
  } catch (err) {
    res.status(500).json(err)
  }
})

// obtener publicaciones de la línea de tiempo
router.get('/timeline/all', async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId)
    const userPosts = await Post.find({ userId: currentUser._id })
    const friendPosts = await Promise.all(
      currentUser.followings.map(friendId => {
        return Post.find({ userId: friendId })
      })
    )
    res.json(userPosts.concat(...friendPosts))
  } catch (err) {
    res.status(500).json(err)
  }
})

module.exports = router
