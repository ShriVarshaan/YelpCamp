const {Campground, campgroundSchemaJoi} = require("./models/campground")
const {Review, reviewSchemaJoi} = require("./models/review")


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash("error", "login/edit to make changes")
        return res.redirect("/login")
    }
    next()
}

module.exports.isAuthorized = async function(req, res, next) {
    const {id} = req.params
    const gettingCampground = await Campground.findById(id)
    if (!gettingCampground.author.equals(req.user._id)){
        req.flash("error", "You do not have permission to do that")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateCampground = function (req, res, next) {
    const campground = req.body
    const result = campgroundSchemaJoi.validate(campground)
    if (result.error){
        return next(result.error)
    }
    next()
}

module.exports.validateReview = function (req, res, next){
    const review = req.body
    const result = reviewSchemaJoi.validate(review)
    if (result.error){
        return next(result.error)
    }
    next()
}