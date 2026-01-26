const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const methodOverride = require("method-override")
const Campground = require("./models/campground")

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

app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))

app.get("/", (req, res) => {
    res.render("home.ejs")
})

app.get("/campgrounds", async function (req, res) {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
})

app.post("/campgrounds", async function (req, res){
    const {campground} = req.body
    const insertCampground = new Campground(campground)
    await insertCampground.save()
    res.redirect(`/campgrounds/${insertCampground._id}`)
})

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new")
})

app.get("/campgrounds/:id", async function (req, res) {
    const {id} = req.params
    const campground = await Campground.findById(id)
    res.render("campgrounds/show", {campground})
})

app.delete("/campgrounds/:id", async function (req, res){
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
})

app.get("/campgrounds/:id/edit", async function (req, res){
    const {id} = req.params
    const campground = await Campground.findById(id)
    res.render("campgrounds/edit", {campground})
})

app.put("/campgrounds/:id", async function (req, res) {
    const {id} = req.params
    const {campground} = req.body
    await Campground.findByIdAndUpdate(id, campground)
    res.redirect(`/campgrounds/${id}`)
})


app.get(/(.*)/, (req, res) => {
    res.send("Catch all page")
})

app.listen(3000)