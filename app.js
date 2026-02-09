const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const flash = require("connect-flash")
const session = require("express-session")
const ejsMate = require("ejs-mate")
const methodOverride = require("method-override")
const ExpressError = require("./utils/ExpressError")
const passport = require("passport")
const User = require("./models/user")
const app = express()

const campgrounds = require("./routes/campgrounds")
const reviews = require("./routes/reviews")
const users = require("./routes/users")

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
app.use(express.static(path.join(__dirname, "public")))

const sessionConfig = {
    secret: "thisismysecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(User.createStrategy()) //this is a diff config might have to change it for consistency

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currentUser = req.user
    next()
})

app.use("/campgrounds/:id/reviews", reviews)
app.use("/campgrounds", campgrounds)
app.use("/", users)

app.get("/", (req, res) => {
    res.render("home.ejs")
})

app.get("/fakeUser", async(req, res) => {
    const user = new User({email: "something@gmail.com", username: "varshaan"})
    const newUser = await User.register(user, "mypassword")
    res.send(newUser)
})


app.get(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page not found"))
})

app.use((err, req, res, next) => {
    const {status = 500, message = "Something went wrong"} = err
    res.status(status).render("error", {status, message})
})

app.listen(3000)