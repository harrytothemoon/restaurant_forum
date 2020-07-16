const bcrypt = require('bcryptjs')
const db = require('../models')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

let userController = {
  signUpPage: (req, res, callback) => {
    callback({ status: 'success', message: '' })
  },
  signInPage: (req, res, callback) => {
    callback({ status: 'success', message: '' })
  },
  getUser: (req, res, callback) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [Restaurant] },
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    }).then(user => {
      let results = new Set()
      let data = user.toJSON().Comments.map(c => c)
      let comments = data.filter(item => !results.has(item.RestaurantId) ? results.add(item.RestaurantId) : false)
      callback({
        getUser: user.toJSON(),
        comments: comments
      })
    })
  },
  editUser: (req, res, callback) => {
    if (Number(req.params.id) === req.user.id) {
      return User.findByPk(req.params.id).then(user => {
        callback({ user: user.toJSON() })
      })
    } else {
      callback({ status: 'error', message: '沒有權限進入他人修改個人資訊頁面！' })
    }
  },
  putUser: (req, res, callback) => {
    if (Number(req.params.id) === req.user.id) {
      if (!req.body.name) {
        callback({ status: 'error', message: "name didn't exist" })
      }

      const { file } = req
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID);
        imgur.upload(file.path, (err, img) => {
          return User.findByPk(req.params.id)
            .then((user) => {
              user.update({
                name: req.body.name,
                image: file ? img.data.link : restaurant.image,
              })
                .then((user) => {
                  callback({ status: 'success', message: "user was successfully to update" })
                })
            })
        })
      }
      else
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              image: user.image,
            })
              .then((user) => {
                callback({ status: 'success', message: "user was successfully to update" })
              })
          })
    } else {
      callback({ status: 'error', message: "沒有權限修改他人資訊！" })
    }
  },

  addFavorite: (req, res, callback) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        callback({ status: 'success', message: '' })
      })
  },
  removeFavorite: (req, res, callback) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            callback({ status: 'success', message: '' })
          })
      })
  },

  addLike: (req, res, callback) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        callback({ status: 'success', message: '' })
      })
  },
  removeLike: (req, res, callback) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            callback({ status: 'success', message: '' })
          })
      })
  },

  getTopUser: (req, res, callback) => {
    // 撈出所有 User 與 followers 資料
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      // 整理 users 資料
      users = users.map(user => ({
        ...user.dataValues,
        // 計算追蹤者人數
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      callback({ users: users })
    })
  },

  addFollowing: (req, res, callback) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        callback({ status: 'success', message: '' })
      })
  },
  removeFollowing: (req, res, callback) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            callback({ status: 'success', message: '' })
          })
      })
  }
}

module.exports = userController