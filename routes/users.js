const express = require("express")
const router = express.Router()
const User = require("../models/user")
const wrapAsync = require("../utils/wrapAsync")
const passport = require("passport")

let returnTo = "/campgrounds"

router.get("/register", (req, res) => {
    res.render("users/register")
})

router.post("/register", wrapAsync(async (req, res, next) => {
    try{
        const {email, username, password} = req.body
        const user = new User({email, username})
        const registeredUser = await User.register(user, password)
        console.log(registeredUser)
        req.login(registeredUser, (err) => {
            if (err){
                return next(err)
            }
            req.flash("success", "Welcome to YelpCamp")
            res.redirect("/campgrounds")
        })
    } catch(e){
        req.flash("error", "something went wrong try again")
        res.redirect("register")
    }
}))

router.get("/login", (req, res) => {
    returnTo = req.session.returnTo || "/campgrounds"
    res.render("users/login")
})

router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), (req, res) => {
    req.flash("success", "welcome back")
    res.redirect(returnTo)
})

router.get("/logout", async (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        req.flash("success", "goodbye")
        console.log("here")
        return res.redirect("/campgrounds")
    })
})

module.exports = router