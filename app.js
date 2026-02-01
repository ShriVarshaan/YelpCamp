const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const ejsMate = require("ejs-mate")
const methodOverride = require("method-override")
const ExpressError = require("./utils/ExpressError")
const wrapAsync = require("./utils/wrapAsync")
const Joi = require("joi")
const {Campground, campgroundSchemaJoi} = require("./models/campground")
const {Review, reviewSchemaJoi} = require("./models/review")

const app = express()

async function main() {
    await mongoose.connect("mongodb://localhost:27017/yelp-camp")
}

main()
    .then(() => {
        console.log("connected successfully")
    })
    .catch((err) => {
        console.error(err)
    })

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.engine("ejs", ejsMate)

app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))

const validateCampground = function (req, res, next) {
    const campground = req.body
    const result = campgroundSchemaJoi.validate(campground)
    if (result.error){
        return next(result.error)
    }
    next()
}

const validateReview = function (req, res, next){
    const review = req.body
    const result = reviewSchemaJoi.validate(review)
    if (result.error){
        return next(result.error)
    }
    next()
}

app.get("/", (req, res) => {
    res.render("home.ejs")
})

app.get("/campgrounds", wrapAsync(async function (req, res) {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}))


app.post("/campgrounds", validateCampground, wrapAsync(async function (req, res, next){
    const {campground} = req.body
    const insertCampground = new Campground(campground)
    await insertCampground.save()
    res.redirect(`/campgrounds/${insertCampground._id}`)
}))

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new")
})

app.get("/campgrounds/:id", wrapAsync(async function (req, res) {
    const {id} = req.params
    const campground = await Campground.findById(id).populate("reviews")
    res.render("campgrounds/show", {campground})
}))

app.delete("/campgrounds/:id", wrapAsync(async function (req, res){
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
}))

app.delete("/campgrounds/:campId/reviews/:id", wrapAsync(async function (req, res) {
    const { campId, id } = req.params
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: id}})
    await Review.findByIdAndDelete(id)
    res.redirect(`/campgrounds/${campId}`)
}))

app.get("/campgrounds/:id/edit", wrapAsync(async function (req, res){
    const {id} = req.params
    const campground = await Campground.findById(id)
    res.render("campgrounds/edit", {campground})
}))

app.put("/campgrounds/:id", validateCampground, wrapAsync(async function (req, res) {
    const {id} = req.params
    const {campground} = req.body
    await Campground.findByIdAndUpdate(id, campground, {runValidators: true})
    res.redirect(`/campgrounds/${id}`)
}))

app.post("/campgrounds/:id/review", validateReview, wrapAsync(async function (req, res) {
    const campground = await Campground.findById(req.params.id)
    const {review} = req.body
    const insertReview = new Review(review)
    campground.reviews.push(insertReview)
    await campground.save()
    await insertReview.save()
    res.redirect(`/campgrounds/${req.params.id}`)
}))


app.get(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page not found"))
})

app.use((err, req, res, next) => {
    const {status = 500, message = "Something went wrong"} = err
    res.status(status).render("error", {status, message})
})

app.listen(3000)