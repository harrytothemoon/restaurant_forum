const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

let restController = {
  getRestaurants: (req, res) => {
    let whereQuery = {}
    let categoryId = ''
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)  //query後為字串
      whereQuery['CategoryId'] = categoryId
    }
    Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset: offset, limit: pageLimit }).then(result => {
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(result.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
      }))
      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })

    })
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: [User] },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ]
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
      const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
      let click = restaurant.dataValues.clicks
      click++
      restaurant.update({
        clicks: click
      })
        .then(() => {
          return res.render('restaurant', {
            restaurant: restaurant.toJSON(),
            isFavorited: isFavorited,
            isLiked: isLiked
          })
        })
    })
  },
  getFeeds: (req, res) => {
    return Restaurant.findAll({
      limit: 10,
      raw: true,
      nest: true,
      order: [['createdAt', 'DESC']],
      include: [Category]
    }).then(restaurants => {
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      }).then(comments => {
        return res.render('feeds', {
          restaurants: restaurants,
          comments: comments
        })
      })
    })
  },
  getDashboard: (req, res) => {
    console.log(req.params.id)
    return Restaurant.findByPk(req.params.id, {
      include: [Category, { model: Comment, include: [User] }]
    }).then(restaurant => {
      let totalComments = restaurant.dataValues.Comments.length
      return res.render('dashboard', {
        restaurant: restaurant.toJSON(),
        totalComments: totalComments
      })

    })
  },
  getTops: (req, res) => {
    return Restaurant.findAll({
      limit: 10,
      include: { model: User, as: 'FavoritedUsers' }
    }).then(restaurants => {
      let data = restaurants.map(r => ({
        ...r.dataValues,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        favoritedNum: r.dataValues.FavoritedUsers.length,
      }))
      data = data.sort((a, b) => b.favoritedNum - a.favoritedNum)
      console.log(data)
      return res.render('topRestaurant', {
        restaurants: data,
      })
    })
  },
}
module.exports = restController