const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync")
const ExpressError = require("../utils/ExpressError")
const Joi = require("joi")
const {Campground, campgroundSchemaJoi} = require("../models/campground");
const { isLoggedIn } = require("../middleware");
// const {Review, reviewSchemaJoi} = require("../models/review")

const validateCampground = function (req, res, next) {
    const campground = req.body
    const result = campgroundSchemaJoi.validate(campground)
    if (result.error){
        return next(result.error)
    }
    next()
}


router.get("/", wrapAsync(async function (req, res) {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}))


router.post("/", isLoggedIn, validateCampground, wrapAsync(async function (req, res, next){
    const {campground} = req.body
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
    const campground = await Campground.findById(id).populate("reviews")
    if(!campground){
        req.flash("error", "Campground not found")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", {campground})
}))

router.delete("/:id", isLoggedIn, wrapAsync(async function (req, res){
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
}))



router.get("/:id/edit", isLoggedIn, wrapAsync(async function (req, res){
    const {id} = req.params
    const campground = await Campground.findById(id)
    res.render("campgrounds/edit", {campground})
}))

router.put("/:id", isLoggedIn, validateCampground, wrapAsync(async function (req, res) {
    const {id} = req.params
    const {campground} = req.body
    await Campground.findByIdAndUpdate(id, campground, {runValidators: true})
    req.flash("success", "successfully updated campground")
    res.redirect(`/campgrounds/${id}`)
}))



module.exports = router