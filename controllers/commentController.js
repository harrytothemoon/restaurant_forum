const db = require('../models')
const Comment = db.Comment

const commentService = require('../services/commentService.js')

let commentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect(`/restaurants/${req.body.restaurantId}`)
      }
    })
  },
  deleteComment: (req, res) => {
    commentService.deleteComment(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  }
}
module.exports = commentController