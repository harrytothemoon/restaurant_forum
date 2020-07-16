const bcrypt = require('bcryptjs')
const db = require('../models')
const imgur = require('imgur-node-api')
const commentController = require('./commentController')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const userService = require('../services/userService.js')

const userController = {
  signUpPage: (req, res) => {
    userService.signUpPage(req, res, (data) => {
      return res.render('signup', data)
    })
  },
  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  signInPage: (req, res) => {
    userService.signInPage(req, res, (data) => {
      return res.render('signin', data)
    })
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    userService.getUser(req, res, (data) => {
      return res.render('user', data)
    })
  },
  editUser: (req, res) => {
    userService.editUser(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', "沒有權限進入他人修改個人資訊頁面！")
        return res.redirect(`/users/${req.params.id}`)
      }
      return res.render('editUser', data)
    })
  },
  putUser: (req, res) => {
    userService.putUser(req, res, (data) => {
      if (data['status'] === 'error') {
        if (Number(req.params.id) !== req.user.id) {
          req.flash('error_messages', '沒有權限修改他人資訊！')
          return res.redirect(`/users/${req.user.id}`)
        }
        req.flash('error_messages', "name didn't exist")
        return res.redirect('back')
      }
      req.flash('success_messages', 'user was successfully to update')
      return res.redirect(`/users/${req.user.id}`)
    })
  },

  addFavorite: (req, res) => {
    userService.addFavorite(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  },
  removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  },

  addLike: (req, res) => {
    userService.addLike(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  },
  removeLike: (req, res) => {
    userService.removeLike(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  },

  getTopUser: (req, res) => {
    userService.getTopUser(req, res, (data) => {
      return res.render('topUser', data)
    })
  },

  addFollowing: (req, res) => {
    userService.addFollowing(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  },
  removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('back')
      }
    })
  }
}

module.exports = userController