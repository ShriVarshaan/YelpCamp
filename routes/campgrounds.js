const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync")
const ExpressError = require("../utils/ExpressError")
const Joi = require("joi")
const {Campground, campgroundSchemaJoi} = require("../models/campground");
const { isLoggedIn, isAuthorized, validateCampground } = require("../middleware");
// const {Review, reviewSchemaJoi} = require("../models/review")






router.get("/", wrapAsync(async function (req, res) {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}))


router.post("/", isLoggedIn, validateCampground, wrapAsync(async function (req, res, next){
    const {campground} = req.body
    campground.author = req.user._id
    const insertCampground = new Campground(campground)
    await insertCampground.save()
    req.flash("success", "successfully made a new campground")
    res.redirect(`/campgrounds/${insertCampground._id}`)
}))

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new")
})

router.get("/:id", wrapAsync(async function (req, res) {
    const {id} = req.params
    const campground = await Campground.findById(id).populate("reviews").populate("author").populate({path: "reviews", populate: "author"})
    if(!campground){
        req.flash("error", "Campground not found")
        return res.redirect("/campgrounds")
    }
    let username
    if (req.user){
        username = req.user.username
    }
    console.log(username)
    res.render("campgrounds/show", {campground, username})
}))

router.delete("/:id", isLoggedIn, isAuthorized, wrapAsync(async function (req, res){
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
}))



router.get("/:id/edit", isLoggedIn, isAuthorized, wrapAsync(async function (req, res){
    const {id} = req.params
    const campground = await Campground.findById(id)
    res.render("campgrounds/edit", {campground})
}))

router.put("/:id", isLoggedIn, isAuthorized, validateCampground, wrapAsync(async function (req, res) {
    const {id} = req.params
    const {campground} = req.body
    await Campground.findByIdAndUpdate(id, campground, {runValidators: true})
    req.flash("success", "successfully updated campground")
    res.redirect(`/campgrounds/${id}`)
}))



module.exports = router