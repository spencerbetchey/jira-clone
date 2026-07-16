const express = require('express')
const router = express.Router({ mergeParams: true })
const { getComments, createComment, deleteComment } = require('../controllers/commentsController')
const authMiddleware = require('../middleware/authMiddleware')

router.use(authMiddleware)

router.get('/', getComments)
router.post('/', createComment)
router.delete('/:id', deleteComment)

module.exports = router