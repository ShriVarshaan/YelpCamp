const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync")
const ExpressError = require("../utils/ExpressError")
const Joi = require("joi")
const {Campground, campgroundSchemaJoi} = require("../models/campground")
const {Review, reviewSchemaJoi} = require("../models/review")
const { isLoggedIn, validateReview } = require("../middleware");



router.get("/", (req, res) =>{
    const {id} = req.params
    res.redirect(`/campgrounds/${id}`)
})

router.delete("/:reviewid", isLoggedIn, wrapAsync(async function (req, res) {
    const { id, reviewid } = req.params
    await Campground.findByIdAndUpdate(reviewid, {$pull: {reviews: reviewid}})
    await Review.findByIdAndDelete(reviewid)
    req.flash("success", "successfully deleted the review")
    res.redirect(`/campgrounds/${id}`)
}))

router.post("/", isLoggedIn, validateReview, wrapAsync(async function (req, res) {
    const campground = await Campground.findById(req.params.id)
    const {review} = req.body
    const insertReview = new Review(review)
    insertReview.author = req.user._id
    campground.reviews.push(insertReview)
    await campground.save()
    await insertReview.save()
    req.flash("success", "successfully added your review")
    res.redirect(`/campgrounds/${req.params.id}`)
}))


module.exports = router